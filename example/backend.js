var RedSys = require("..");

const MERCHANT_KEY = "sq7HjrUOBfKmC576ILgskD5srU870gJ7";
const pos = new RedSys(MERCHANT_KEY);

var obj = {
  amount: "100", // cents
  orderReference: "1508428360",
  merchantName: "INTEGRATION TEST SHOP",
  merchantCode: "327234688",
  currency: RedSys.CURRENCIES.EUR,
  transactionType: RedSys.TRANSACTION_TYPES.AUTHORIZATION,
  terminal: "1",
  merchantURL: "http://www.my-shop.com/",
  successURL: "http://localhost:8080/success",
  errorURL: "http://localhost:8080/error"
};

// Make a payment
var result = pos.makePaymentParameters(obj);
console.log(`makePaymentParameters():
${JSON.stringify(result, null, 2)}

`);

// Check a response
const merchantParams =
  "eyJEc19EYXRlIjoiMTAlMkYwNiUyRjIwMTgiLCJEc19Ib3VyIjoiMjAlM0EyNiIsIkRzX1NlY3VyZVBheW1lbnQiOiIwIiwiRHNfQW1vdW50IjoiNjAwMCIsIkRzX0N1cnJlbmN5IjoiOTc4IiwiRHNfT3JkZXIiOiIwMDAwNTg0NDFDMCIsIkRzX01lcmNoYW50Q29kZSI6IjM0NjM4MTkwOCIsIkRzX1Rlcm1pbmFsIjoiMDAxIiwiRHNfUmVzcG9uc2UiOiI5OTE1IiwiRHNfTWVyY2hhbnREYXRhIjoiIiwiRHNfVHJhbnNhY3Rpb25UeXBlIjoiMCIsIkRzX0NvbnN1bWVyTGFuZ3VhZ2UiOiIxIiwiRHNfRXJyb3JDb2RlIjoiU0lTOTkxNSIsIkRzX0F1dGhvcmlzYXRpb25Db2RlIjoiKysrKysrIn0=";
const signature = "LQDIuaVKbZx2pXe0nvr4EQ2snHuPyjcLtAzEgcyv8hc=";
const invalidSignature = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa=";

result = pos.checkResponseParameters(merchantParams, signature);
console.log(`VALID checkResponseParameters():
${JSON.stringify(result, null, 2)}
`);

result = pos.checkResponseParameters(merchantParams, invalidSignature);
console.log(`INVALID checkResponseParameters():
${JSON.stringify(result, null, 2)}`);
