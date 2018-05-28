var crypto = require("crypto");
const base64url = require("base64url");
const { toBuffer } = require("./buffer-util.js");
const {
  CURRENCIES,
  TRANSACTION_TYPES,
  APPROVAL_CODES,
  TRANSACTION_ERROR_CODES,
  SIS_ERROR_CODES
} = require("./lib.js");

class RedSys {
  constructor(merchantSecretKey) {
    if (!merchantSecretKey)
      throw new Error("The merchant secret key is mandatory");
    this.merchantSecretKey = merchantSecretKey;
  }

  makePaymentParameters({
    amount,
    orderReference,
    merchantName,
    merchantCode,
    currency,
    transactionType,
    terminal = "1",
    merchantURL,
    successURL,
    errorURL
  }) {
    if (!amount) throw new Error("The amount to charge is mandatory");
    if (!merchantCode) throw new Error("The merchant code is mandatory");
    if (!transactionType) throw new Error("The transcation type is mandatory");
    if (!successURL) throw new Error("The successURL is mandatory");
    if (!errorURL) throw new Error("The errorURL is mandatory");

    if (!currency) currency = CURRENCIES.EUR;
    if (!orderReference) {
      orderReference = Date.now();
      console.log("Warning: no orderReference provided. Using", orderReference);
    }

    const paramsObj = {
      DS_MERCHANT_AMOUNT: String(amount),
      DS_MERCHANT_ORDER: orderReference,
      DS_MERCHANT_MERCHANTNAME: merchantName,
      DS_MERCHANT_MERCHANTCODE: merchantCode,
      DS_MERCHANT_CURRENCY: currency,
      DS_MERCHANT_TRANSACTIONTYPE: transactionType,
      DS_MERCHANT_TERMINAL: terminal,
      DS_MERCHANT_MERCHANTURL: merchantURL || "",
      DS_MERCHANT_URLOK: successURL || "",
      DS_MERCHANT_URLKO: errorURL || ""
    };

    const Ds_MerchantParameters = new Buffer(
      JSON.stringify(paramsObj)
    ).toString("base64");
    const derivateKey = this.encrypt(orderReference);
    const Ds_Signature = this.sign(Ds_MerchantParameters, derivateKey);

    return {
      Ds_SignatureVersion: "HMAC_SHA256_V1",
      Ds_MerchantParameters,
      Ds_Signature
    };
  }

  checkResponseParameters(strPayload, givenSignature) {
    if (!strPayload) throw new Error("The payload parameter is required");
    else if (typeof strPayload != "string")
      throw new Error("Payload must be a base-64 encoded string");
    else if (!givenSignature) throw new Error("The signature is required");

    // FIX: Query string parsers are not expected to detect trailing "=="
    // but requests from RedSys are signed with the payload containing them
    //
    // Add them if they are expected to be there

    const suffix = base64url.toBase64(strPayload).match(/=*$/);
    if (suffix && suffix[0]) {
      strPayload += suffix[0];
    }

    var merchantParams = JSON.parse(base64url.decode(strPayload, "utf8"));
    if (!merchantParams || !merchantParams.Ds_Order) return null; // invalid response
    // decode url encoded values
    for (let field in merchantParams) {
      merchantParams[field] = decodeURIComponent(merchantParams[field]);
    }

    const derivateKey = this.encrypt(merchantParams.Ds_Order);
    const localSignature = this.sign(strPayload, derivateKey);

    if (base64url.toBase64(givenSignature) !== localSignature) return null;
    else return merchantParams;
  }

  static getResponseCodeMessage(code) {
    if (!code || typeof code !== "string") return null;
    code = code.replace(/^0*/, "");

    if (APPROVAL_CODES[code]) return APPROVAL_CODES[code];
    else if (TRANSACTION_ERROR_CODES[code])
      return TRANSACTION_ERROR_CODES[code];
    else if (SIS_ERROR_CODES[code]) return SIS_ERROR_CODES[code];
    else return null;
  }

  // INTERNAL UTILS

  encrypt(strPayload) {
    // 3DES (base64)
    var keyBuffer = new Buffer(this.merchantSecretKey, "base64");
    var iv = new Buffer(8);
    iv.fill(0);
    var crypt = crypto.createCipheriv("des-ede3-cbc", keyBuffer, iv);
    crypt.setAutoPadding(false);
    return (
      crypt.update(toBuffer(strPayload), "utf8", "base64") +
      crypt.final("base64")
    );
  }

  sign(strPayload, strKey) {
    // MAC256 (base64)
    if (typeof strPayload !== "string" || typeof strKey !== "string")
      throw new Error("Invalid parameters");

    const hash = crypto.createHmac("sha256", new Buffer(strKey, "base64"));
    hash.update(strPayload);

    return hash.digest("base64");
  }
}

module.exports = RedSys;

module.exports.CURRENCIES = CURRENCIES;
module.exports.TRANSACTION_TYPES = TRANSACTION_TYPES;
module.exports.APPROVAL_CODES = APPROVAL_CODES;
module.exports.TRANSACTION_ERROR_CODES = TRANSACTION_ERROR_CODES;
module.exports.SIS_ERROR_CODES = SIS_ERROR_CODES;
