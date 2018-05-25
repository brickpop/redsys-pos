RedSys POS
---

NodeJS library to ease the communication with RedSys point of sales

## Installation

Install the NPM package:
```
npm install redsys-pos
```

## Usage
### Generating a request

Generate the parameters to create a transaction:

```javascript
const {
    initialize,
    makePaymentParameters,
    CURRENCIES,
    TRANSACTION_TYPES
} = require('redsys-pos');

const MERCHANT_KEY = "sq7HjrUOBfKmC576ILgskD5srU870gJ7"; // TESTING KEY
initialize(MERCHANT_KEY);

var obj = {
    amount: '100', // cents (in euro)
    orderReference: '1508428360',
    merchantName: "INTEGRATION TEST SHOP",
    merchantCode: '327234688',
    currency: CURRENCIES.EUR,
    transactionType: TRANSACTION_TYPES.AUTHORIZATION, // '0'
    terminal: '1',
    merchantURL: 'http://myshop.com/merchant',
    successURL: 'http://myshop.com/success',
    errorURL: 'http://myshop.com/error'
}

const result = makePaymentParameters(obj);
console.log(result);
```

The above code will print:

```javascript
{
  Ds_SignatureVersion: 'HMAC_SHA256_V1',
  Ds_MerchantParameters: 'eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxMDAiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjE1MDg0MjgzNjAiLCJEU19NRVJDSEFOVF9NRVJDSEFOVE5BTUUiOiJUZXN0aW5nIFNob3AiLCJEU19NRVJDSEFOVF9NRVJDSEFOVENPREUiOiIzMjcyMzQ2ODgiLCJEU19NRVJDSEFOVF9DVVJSRU5DWSI6Ijk3OCIsIkRTX01FUkNIQU5UX1RSQU5TQUNUSU9OVFlQRSI6IjAiLCJEU19NRVJDSEFOVF9URVJNSU5BTCI6IjEiLCJEU19NRVJDSEFOVF9NRVJDSEFOVFVSTCI6IiIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3N1Y2Nlc3MiLCJEU19NRVJDSEFOVF9VUkxLTyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9lcnJvciJ9',
  Ds_Signature: 'qkMJMWR6Dq32xwbQuguTv39OvXv4KdD1Xg7pZ8phGZI='
}
```

Send the above JSON to the browser, and submit a form like below:

```javascript
const DEBUG = ...;
var result = { ... }; // The response above from the server

var form = document.createElement("form");
if(DEBUG) {
    form.setAttribute("action", "https://sis-t.redsys.es:25443/sis/realizarPago")
} else {
    form.setAttribute("action", "https://sis.redsys.es/sis/realizarPago")
}
form.setAttribute("method", "POST");
form.setAttribute("style", "display: none");

// Parameters
var field = document.createElement("input");
field.setAttribute("type", "hidden");
field.setAttribute("name", "Ds_SignatureVersion");
field.setAttribute("value", result.Ds_SignatureVersion);
form.appendChild(field);

var field = document.createElement("input");
field.setAttribute("type", "hidden");
field.setAttribute("name", "Ds_MerchantParameters");
field.setAttribute("value", result.Ds_MerchantParameters);
form.appendChild(field);

var field = document.createElement("input");
field.setAttribute("type", "hidden");
field.setAttribute("name", "Ds_Signature");
field.setAttribute("value", result.Ds_Signature);
form.appendChild(field);

document.body.appendChild(form);
form.submit();
```

For a detailed example, check out `example/frontend.html`;

The official recommended mechanism is a plain old HTML form as below, which is an equivalent of the JS code above:

```html
    <form name="from" action="https://sis-t.redsys.es:25443/sis/realizarPago" method="POST">
        <input type="hidden" name="Ds_SignatureVersion" value="HMAC_SHA256_V1" />
        <input type="hidden" name="Ds_MerchantParameters" value="eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxMDAiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjE1MDg0MjgzNjAiLCJEU19NRVJDSEFOVF9NRVJDSEFOVE5BTUUiOiJUZXN0aW5nIFNob3AiLCJEU19NRVJDSEFOVF9NRVJDSEFOVENPREUiOiIzMjcyMzQ2ODgiLCJEU19NRVJDSEFOVF9DVVJSRU5DWSI6Ijk3OCIsIkRTX01FUkNIQU5UX1RSQU5TQUNUSU9OVFlQRSI6IjAiLCJEU19NRVJDSEFOVF9URVJNSU5BTCI6IjEiLCJEU19NRVJDSEFOVF9NRVJDSEFOVFVSTCI6IiIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3N1Y2Nlc3MiLCJEU19NRVJDSEFOVF9VUkxLTyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9lcnJvciJ9" />
        <input type="hidden" name="Ds_Signature" value="qkMJMWR6Dq32xwbQuguTv39OvXv4KdD1Xg7pZ8phGZI=" />
    </form>
```

### Checking a response

```javascript
// Check a response
const { checkResponseParameters } = require("redsys-pos");

const merchantParams = "eyJEc19EYXRlIjoiMjAlMkYxMCUyRjIwMTciLCJEc19Ib3VyIjoiMTclM0EyMyIsIkRzX1NlY3VyZVBheW1lbnQiOiIwIiwiRHNfQW1vdW50IjoiMTAwIiwiRHNfQ3VycmVuY3kiOiI5NzgiLCJEc19PcmRlciI6IjAwMDA5NjU1RDg0IiwiRHNfTWVyY2hhbnRDb2RlIjoiMzI3MjM0Njg4IiwiRHNfVGVybWluYWwiOiIwMDEiLCJEc19SZXNwb25zZSI6Ijk5MTUiLCJEc19UcmFuc2FjdGlvblR5cGUiOiIwIiwiRHNfTWVyY2hhbnREYXRhIjoiIiwiRHNfQXV0aG9yaXNhdGlvbkNvZGUiOiIrKysrKysiLCJEc19Db25zdW1lckxhbmd1YWdlIjoiMSJ9";
const signature = "vrUsaNbxfonyn4ONUos6oosUaTBY0_SGoKDel6qsHqk=";

const result = checkResponseParameters(merchantParams, signature);
console.log(result);
```

If successful, this will print:

```javascript
{
  Ds_Date: '20%2F10%2F2017',
  Ds_Hour: '18%3A20',
  Ds_SecurePayment: '1',
  Ds_Amount: '100',
  Ds_Currency: '978',
  Ds_Order: '00007921799',
  Ds_MerchantCode: '327234688',
  Ds_Terminal: '001',
  Ds_Response: '0000',
  Ds_TransactionType: '0',
  Ds_MerchantData: '',
  Ds_AuthorisationCode: '678746',
  Ds_ConsumerLanguage: '1',
  Ds_Card_Country: '724',
  Ds_Card_Brand: '1'
}
```

### Checking an invalid response/signature
If an invalid response or signature is provided:

```javascript
// Check a response
const { checkResponseParameters } = require("redsys-pos");

const merchantParams = "eyJEc19EYXRlIjoiMjAlMkYxMCUyRjIwMTciLCJEc19Ib3VyIjoiMTclM0EyMyIsIkRzX1NlY3VyZVBheW1lbnQiOiIwIiwiRHNfQW1vdW50IjoiMTAwIiwiRHNfQ3VycmVuY3kiOiI5NzgiLCJEc19PcmRlciI6IjAwMDA5NjU1RDg0IiwiRHNfTWVyY2hhbnRDb2RlIjoiMzI3MjM0Njg4IiwiRHNfVGVybWluYWwiOiIwMDEiLCJEc19SZXNwb25zZSI6Ijk5MTUiLCJEc19UcmFuc2FjdGlvblR5cGUiOiIwIiwiRHNfTWVyY2hhbnREYXRhIjoiIiwiRHNfQXV0aG9yaXNhdGlvbkNvZGUiOiIrKysrKysiLCJEc19Db25zdW1lckxhbmd1YWdlIjoiMSJ9";
const invalidSignature = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa=";

result = checkResponseParameters(merchantParams, invalidSignature);
console.log(result);
```

This will print:

```javascript
null
```

### Checking a response code

```javascript
const { getResponseCodeMessage } = require("redsys-pos");

var str = getResponseCodeMessage("0180");
console.log(str);
```

This will print:

```
Operación no permitida para ese tipo de tarjeta.
```

### Checking an invalid response code

```javascript
const { getResponseCodeMessage } = require("redsys-pos");

var str = getResponseCodeMessage("xyz");
console.log(str);
```

This will print:

```
null
```

## About

The present library is a work of Jordi Moraleda and Joel Moreno

Node.js "crypto" implementation by Josep Subils