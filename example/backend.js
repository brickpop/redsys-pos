var sabadellPOS = require('..');

const TESTING_MERCHANT_KEY = "sq7HjrUOBfKmC576ILgskD5srU870gJ7";
sabadellPOS.initialize(TESTING_MERCHANT_KEY);

var obj = {
    amount: '100', // cents
    orderReference: '1508428360',
    merchantName: "INTEGRATION TEST SHOP",
    merchantCode: '327234688',
    currency: sabadellPOS.CURRENCIES.EUR,
    transactionType: sabadellPOS.TRANSACTION_TYPES.AUTHORIZATION,
    terminal: '1',
    merchantURL: 'http://www.my-shop.com/',
    successURL: 'http://localhost:8080/success',
    errorURL: 'http://localhost:8080/error'
}

// Make a payment
var result = sabadellPOS.makePaymentParameters(obj);
console.log(`makePaymentParameters():
${JSON.stringify(result, null, 2)}

`);

// Check a response
const merchantParams = "eyJEc19EYXRlIjoiMjAlMkYxMCUyRjIwMTciLCJEc19Ib3VyIjoiMTclM0EyMyIsIkRzX1NlY3VyZVBheW1lbnQiOiIwIiwiRHNfQW1vdW50IjoiMTAwIiwiRHNfQ3VycmVuY3kiOiI5NzgiLCJEc19PcmRlciI6IjAwMDA5NjU1RDg0IiwiRHNfTWVyY2hhbnRDb2RlIjoiMzI3MjM0Njg4IiwiRHNfVGVybWluYWwiOiIwMDEiLCJEc19SZXNwb25zZSI6Ijk5MTUiLCJEc19UcmFuc2FjdGlvblR5cGUiOiIwIiwiRHNfTWVyY2hhbnREYXRhIjoiIiwiRHNfQXV0aG9yaXNhdGlvbkNvZGUiOiIrKysrKysiLCJEc19Db25zdW1lckxhbmd1YWdlIjoiMSJ9";
const signature = "vrUsaNbxfonyn4ONUos6oosUaTBY0_SGoKDel6qsHqk=";
const invalidSignature = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa=";

result = sabadellPOS.checkResponseParameters(merchantParams, signature);
console.log(`VALID checkResponseParameters():
${JSON.stringify(result, null, 2)}
`);

result = sabadellPOS.checkResponseParameters(merchantParams, invalidSignature);
console.log(`INVALID checkResponseParameters():
${JSON.stringify(result, null, 2)}`);
