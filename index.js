var crypto = require('crypto');
var Buffer = require('buffer').Buffer;
var MCrypt = require('mcrypt').MCrypt;
const { CURRENCIES, TRANSACTION_TYPES } = require('./lib.js');

var config = {
    initialized: false,
    MERCHANT_SECRET_KEY: '', //base64
    SABADELL_TEST_URL: 'https://sis-t.redsys.es:25443/sis/realizarPago',
    SABADELL_URL: 'https://sis.redsys.es/sis/realizarPago'
};

exports.CURRENCIES = CURRENCIES;
exports.TRANSACTION_TYPES = TRANSACTION_TYPES;

exports.initialize = function (merchantSecretKey) {
    if (!merchantSecretKey) throw new Error("The merchant secret key is mandatory");
    config.MERCHANT_SECRET_KEY = merchantSecretKey;
    config.initialized = true;
}

function makeTransactionKey(orderRef) {
    if (!config.initialized) throw new Error("You must initialize your secret key first");

    var crypt = new MCrypt('tripledes', 'cbc');
    let iv = Buffer.alloc(8);
    crypt.open(Buffer.from(config.MERCHANT_SECRET_KEY, "base64"), iv);

    var ciphertext = crypt.encrypt(orderRef);
    // var encodedKey = Buffer.concat([ciphertext]).toString('base64');
    return ciphertext;
}

exports.makePaymentParameters = function ({ amount, orderReference, merchantName, merchantCode, currency, transactionType, terminal = "1", merchantURL, successURL, errorURL }) {
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
        DS_MERCHANT_MERCHANTURL: merchantURL || '',
        DS_MERCHANT_URLOK: successURL || '',
        DS_MERCHANT_URLKO: errorURL || ''
    }

    const payload = JSON.stringify(paramsObj);
    const payloadBuffer = new Buffer(payload);

    const derivateKey = makeTransactionKey(orderReference);

    const hash = crypto.createHmac('sha256', derivateKey);
    hash.update(payloadBuffer.toString('base64'));

    const signature = hash.digest('base64');

    return {
        Ds_SignatureVersion: "HMAC_SHA256_V1",
        Ds_MerchantParameters: payloadBuffer.toString('base64'),
        Ds_Signature: signature
    };
}

function decodeResponseParameters (payload) {
    if (typeof payload != "string") throw new Error("Payload must be a base-64 encoded string");
    const result = Buffer.from(payload, "base64").toString();
    return JSON.parse(result);
}

exports.checkResponseParameters = function(strPayload, givenSignature){
    if (!config.initialized) throw new Error("You must initialize your secret key first");

    const payload = decodeResponseParameters(strPayload);

    var crypt = new MCrypt('tripledes', 'cbc');
    let iv = Buffer.alloc(8);
    crypt.open(Buffer.from(config.MERCHANT_SECRET_KEY, "base64"), iv);

    var encryptedDsOrder = crypt.encrypt(payload.Ds_Order);
    
    const hash = crypto.createHmac('sha256', encryptedDsOrder);
    hash.update(strPayload);

    const localSignature = hash.digest('base64');

    if(localSignature == givenSignature.replace(/-/g, '+').replace(/_/g, '/')) return payload;
    else return null;
}
