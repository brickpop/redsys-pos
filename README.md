Sabadell POS
---

Node JS library to ease the communication between an e-commerce and Banc Sabadell

## Installation

Install the NPM package:
```
npm install sabadell-pos
```

## Usage
Generate the parameters to create a transaction:

```
var sabadellPOS = require('..');

const TESTING_MERCHANT_KEY = "sq7HjrUOBfKmC576ILgskD5srU870gJ7";
sabadellPOS.initialize(TESTING_MERCHANT_KEY);

var obj = {
    amount: '100', // cents (in euro)
    orderReference: '1508428360',
    merchantName: "INTEGRATION TEST SHOP",
    merchantCode: '327234688',
    currency: sabadellPOS.CURRENCIES.EUR,
    transactionType: sabadellPOS.TRANSACTION_TYPES.AUTHORIZATION, // '0'
    terminal: '1',
    merchantURL: 'http://www.my-shop.com/',
    successURL: 'http://localhost:8080/success',
    errorURL: 'http://localhost:8080/error'
}

const result = sabadellPOS.makePaymentParameters(obj);
console.log(result);
```

This will print:

```
{
  Ds_SignatureVersion: 'HMAC_SHA256_V1',
  Ds_MerchantParameters: 'eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxMDAiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjE1MDg0MjgzNjAiLCJEU19NRVJDSEFOVF9NRVJDSEFOVE5BTUUiOiJUZXN0aW5nIFNob3AiLCJEU19NRVJDSEFOVF9NRVJDSEFOVENPREUiOiIzMjcyMzQ2ODgiLCJEU19NRVJDSEFOVF9DVVJSRU5DWSI6Ijk3OCIsIkRTX01FUkNIQU5UX1RSQU5TQUNUSU9OVFlQRSI6IjAiLCJEU19NRVJDSEFOVF9URVJNSU5BTCI6IjEiLCJEU19NRVJDSEFOVF9NRVJDSEFOVFVSTCI6IiIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3N1Y2Nlc3MiLCJEU19NRVJDSEFOVF9VUkxLTyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9lcnJvciJ9',
  Ds_Signature: 'qkMJMWR6Dq32xwbQuguTv39OvXv4KdD1Xg7pZ8phGZI='
}
```

Send the above JSON to the client app, and submit an HTML form like below:

```
    <form name="from" action="https://sis-t.redsys.es:25443/sis/realizarPago" method="POST">
        <input type="hidden" name="Ds_SignatureVersion" value="HMAC_SHA256_V1" />
        <input type="hidden" name="Ds_MerchantParameters" value="eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxMDAiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjE1MDg0MjgzNjAiLCJEU19NRVJDSEFOVF9NRVJDSEFOVE5BTUUiOiJUZXN0aW5nIFNob3AiLCJEU19NRVJDSEFOVF9NRVJDSEFOVENPREUiOiIzMjcyMzQ2ODgiLCJEU19NRVJDSEFOVF9DVVJSRU5DWSI6Ijk3OCIsIkRTX01FUkNIQU5UX1RSQU5TQUNUSU9OVFlQRSI6IjAiLCJEU19NRVJDSEFOVF9URVJNSU5BTCI6IjEiLCJEU19NRVJDSEFOVF9NRVJDSEFOVFVSTCI6IiIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3N1Y2Nlc3MiLCJEU19NRVJDSEFOVF9VUkxLTyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9lcnJvciJ9" />
        <input type="hidden" name="Ds_Signature" value="qkMJMWR6Dq32xwbQuguTv39OvXv4KdD1Xg7pZ8phGZI=" />
    </form>
```

