var crypto = require('crypto')
var Buffer = require('buffer').Buffer
const { CURRENCIES, TRANSACTION_TYPES, APPROVAL_CODES, TRANSACTION_ERROR_CODES, SIS_ERROR_CODES } = require('./lib.js')

function zeroPad(buf, blocksize) {
  if (typeof buf === 'string') {
    buf = new Buffer(buf, 'utf8')
  }
  var pad = new Buffer((blocksize - (buf.length % blocksize)) % blocksize)
  pad.fill(0)
  return Buffer.concat([buf, pad])
}

function encryptOrder (orderRef) {
  if (!config.initialized) throw new Error("You must initialize your secret key first")
  const secretKey = new Buffer(config.MERCHANT_SECRET_KEY, 'base64')
  const iv = new Buffer(8)
  iv.fill(0)
  const cipher = crypto.createCipheriv('des-ede3-cbc', secretKey, iv)
  cipher.setAutoPadding(false)
  const zerores = zeroPad(orderRef, 8)
  const res = cipher.update(zerores, 'utf8', 'base64') + cipher.final('base64')
  return res
}

var config = {
  initialized: false,
  MERCHANT_SECRET_KEY: '', //base64
  SANDBOX_URL: 'https://sis-t.redsys.es:25443/sis/realizarPago',
  PRODUCTION_URL: 'https://sis.redsys.es/sis/realizarPago'
}

exports.CURRENCIES = CURRENCIES
exports.TRANSACTION_TYPES = TRANSACTION_TYPES
exports.APPROVAL_CODES = APPROVAL_CODES
exports.TRANSACTION_ERROR_CODES = TRANSACTION_ERROR_CODES
exports.SIS_ERROR_CODES = SIS_ERROR_CODES

exports.initialize = function (merchantSecretKey) {
  if (!merchantSecretKey) throw new Error("The merchant secret key is mandatory")
  config.MERCHANT_SECRET_KEY = merchantSecretKey
  config.initialized = true
}

exports.makePaymentParameters = function ({ amount, orderReference, merchantName, merchantCode, currency, transactionType, terminal = "1", merchantURL, successURL, errorURL }) {
  if (!amount) throw new Error("The amount to charge is mandatory")
  if (!merchantCode) throw new Error("The merchant code is mandatory")
  if (!transactionType) throw new Error("The transcation type is mandatory")
  if (!successURL) throw new Error("The successURL is mandatory")
  if (!errorURL) throw new Error("The errorURL is mandatory")

  if (!currency) currency = CURRENCIES.EUR
  if (!orderReference) {
    orderReference = Date.now()
    console.log("Warning: no orderReference provided. Using", orderReference)
  }

  const paramsObj = {
    DS_MERCHANT_AMOUNT: String(amount),
    DS_MERCHANT_ORDER: orderReference,
    DS_MERCHANT_MERCHANTNAME: merchantName,
    DS_MERCHANT_MERCHANTCODE: merchantCode,
    DS_MERCHANT_CURRENCY: currency,
    DS_MERCHANT_TRANSACTIONTYPE: transactionType,
    DS_MERCHANT_TERMINAL: terminal,
    DS_MERCHANT_MERCHANTURL: merchantURL || '',
    DS_MERCHANT_URLOK: successURL || '',
    DS_MERCHANT_URLKO: errorURL || ''
  }

  const payload = JSON.stringify(paramsObj)
  const payloadBuffer = new Buffer(payload)
  const Ds_MerchantParameters = payloadBuffer.toString('base64')
  const derivateKey = encryptOrder(orderReference)

  const hexMac256 = crypto.createHmac('sha256', new Buffer(derivateKey, 'base64'))
    .update(Ds_MerchantParameters)
    .digest('hex')
  const Ds_Signature = new Buffer(hexMac256, 'hex').toString('base64')


  return {
    Ds_SignatureVersion: "HMAC_SHA256_V1",
    Ds_MerchantParameters,
    Ds_Signature
  }
}

function decodeResponseParameters(payload) {
  if (typeof payload != "string") throw new Error("Payload must be a base-64 encoded string")
  const result = Buffer.from(payload, "base64").toString()
  return JSON.parse(result)
}

exports.checkResponseParameters = function (strPayload, givenSignature) {
  if (!config.initialized) throw new Error("You must initialize the component first")
  else if (!strPayload) throw new Error("The payload is required")
  else if (!givenSignature) throw new Error("The signature is required")

  const payload = decodeResponseParameters(strPayload)
  if (!payload || !payload.Ds_Order) return null // invalid response
  const derivateKey = encryptOrder(payload.Ds_Order)

  const hexMac256 = crypto.createHmac('sha256', new Buffer(derivateKey, 'base64'))
    .update(strPayload)
    .digest('hex')
  const signature = new Buffer(hexMac256, 'hex').toString('base64')

  if(signature.equals(givenSignature)) return payload
  else return null
}

exports.getResponseCodeMessage = function (code) {
  if (!code || typeof code !== "string") return null
  code = code.replace(/^0*/, '')

  if (APPROVAL_CODES[code]) return APPROVAL_CODES[code]
  else if (TRANSACTION_ERROR_CODES[code]) return TRANSACTION_ERROR_CODES[code]
  else if (SIS_ERROR_CODES[code]) return SIS_ERROR_CODES[code]
  else return null
}

