Sabadell POS
---

Node JS library to ease the communication between an e-commerce and Banc Sabadell

## Installation

Install the NPM package:
```
npm install sabadell-pos
```

## Usage
### Generating a request

Generate the parameters to create a transaction:

```javascript
var sabadellPOS = require('sabadell-pos');

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

```javascript
{
  Ds_SignatureVersion: 'HMAC_SHA256_V1',
  Ds_MerchantParameters: 'eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxMDAiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjE1MDg0MjgzNjAiLCJEU19NRVJDSEFOVF9NRVJDSEFOVE5BTUUiOiJUZXN0aW5nIFNob3AiLCJEU19NRVJDSEFOVF9NRVJDSEFOVENPREUiOiIzMjcyMzQ2ODgiLCJEU19NRVJDSEFOVF9DVVJSRU5DWSI6Ijk3OCIsIkRTX01FUkNIQU5UX1RSQU5TQUNUSU9OVFlQRSI6IjAiLCJEU19NRVJDSEFOVF9URVJNSU5BTCI6IjEiLCJEU19NRVJDSEFOVF9NRVJDSEFOVFVSTCI6IiIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3N1Y2Nlc3MiLCJEU19NRVJDSEFOVF9VUkxLTyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9lcnJvciJ9',
  Ds_Signature: 'qkMJMWR6Dq32xwbQuguTv39OvXv4KdD1Xg7pZ8phGZI='
}
```

Send the above JSON to the client app, and submit an HTML form like below:

```html
    <form name="from" action="https://sis-t.redsys.es:25443/sis/realizarPago" method="POST">
        <input type="hidden" name="Ds_SignatureVersion" value="HMAC_SHA256_V1" />
        <input type="hidden" name="Ds_MerchantParameters" value="eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxMDAiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjE1MDg0MjgzNjAiLCJEU19NRVJDSEFOVF9NRVJDSEFOVE5BTUUiOiJUZXN0aW5nIFNob3AiLCJEU19NRVJDSEFOVF9NRVJDSEFOVENPREUiOiIzMjcyMzQ2ODgiLCJEU19NRVJDSEFOVF9DVVJSRU5DWSI6Ijk3OCIsIkRTX01FUkNIQU5UX1RSQU5TQUNUSU9OVFlQRSI6IjAiLCJEU19NRVJDSEFOVF9URVJNSU5BTCI6IjEiLCJEU19NRVJDSEFOVF9NRVJDSEFOVFVSTCI6IiIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3N1Y2Nlc3MiLCJEU19NRVJDSEFOVF9VUkxLTyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9lcnJvciJ9" />
        <input type="hidden" name="Ds_Signature" value="qkMJMWR6Dq32xwbQuguTv39OvXv4KdD1Xg7pZ8phGZI=" />
    </form>
```

For a programatic example, check out the third example on `example/frontend.html`;

### Checking a response

```javascript
// Check a response
const merchantParams = "eyJEc19EYXRlIjoiMjAlMkYxMCUyRjIwMTciLCJEc19Ib3VyIjoiMTclM0EyMyIsIkRzX1NlY3VyZVBheW1lbnQiOiIwIiwiRHNfQW1vdW50IjoiMTAwIiwiRHNfQ3VycmVuY3kiOiI5NzgiLCJEc19PcmRlciI6IjAwMDA5NjU1RDg0IiwiRHNfTWVyY2hhbnRDb2RlIjoiMzI3MjM0Njg4IiwiRHNfVGVybWluYWwiOiIwMDEiLCJEc19SZXNwb25zZSI6Ijk5MTUiLCJEc19UcmFuc2FjdGlvblR5cGUiOiIwIiwiRHNfTWVyY2hhbnREYXRhIjoiIiwiRHNfQXV0aG9yaXNhdGlvbkNvZGUiOiIrKysrKysiLCJEc19Db25zdW1lckxhbmd1YWdlIjoiMSJ9";
const signature = "vrUsaNbxfonyn4ONUos6oosUaTBY0_SGoKDel6qsHqk=";

result = sabadellPOS.checkResponseParameters(merchantParams, signature);
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
const merchantParams = "eyJEc19EYXRlIjoiMjAlMkYxMCUyRjIwMTciLCJEc19Ib3VyIjoiMTclM0EyMyIsIkRzX1NlY3VyZVBheW1lbnQiOiIwIiwiRHNfQW1vdW50IjoiMTAwIiwiRHNfQ3VycmVuY3kiOiI5NzgiLCJEc19PcmRlciI6IjAwMDA5NjU1RDg0IiwiRHNfTWVyY2hhbnRDb2RlIjoiMzI3MjM0Njg4IiwiRHNfVGVybWluYWwiOiIwMDEiLCJEc19SZXNwb25zZSI6Ijk5MTUiLCJEc19UcmFuc2FjdGlvblR5cGUiOiIwIiwiRHNfTWVyY2hhbnREYXRhIjoiIiwiRHNfQXV0aG9yaXNhdGlvbkNvZGUiOiIrKysrKysiLCJEc19Db25zdW1lckxhbmd1YWdlIjoiMSJ9";
const invalidSignature = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa=";

result = sabadellPOS.checkResponseParameters(merchantParams, invalidSignature);
console.log(result);
```

This will print:

```javascript
null
```

### Checking a response code

```javascript
var str = sabadellPOS.getResponseCodeMessage("0180");
console.log(str);
```

This will print:

```
Operación no permitida para ese tipo de tarjeta.
```

### Checking an invalid response code

```javascript
var str = sabadellPOS.getResponseCodeMessage("xyz");
console.log(str);
```

This will print:

```
null
```
