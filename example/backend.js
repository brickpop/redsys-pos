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
  "eyJEc19EYXRlIjoiMjglMkYwNSUyRjIwMTgiLCJEc19Ib3VyIjoiMTAlM0E0NCIsIkRzX1NlY3VyZVBheW1lbnQiOiIxIiwiRHNfQW1vdW50IjoiNjcwMCIsIkRzX0N1cnJlbmN5IjoiOTc4IiwiRHNfT3JkZXIiOiIwMDAwRkI5QTE3MiIsIkRzX01lcmNoYW50Q29kZSI6IjMzNjcwNDY1NSIsIkRzX1Rlcm1pbmFsIjoiMDAxIiwiRHNfUmVzcG9uc2UiOiIwMDAwIiwiRHNfVHJhbnNhY3Rpb25UeXBlIjoiMCIsIkRzX01lcmNoYW50RGF0YSI6IiIsIkRzX0F1dGhvcmlzYXRpb25Db2RlIjoiMjE4MDQ4IiwiRHNfQ29uc3VtZXJMYW5ndWFnZSI6IjEiLCJEc19DYXJkX0NvdW50cnkiOiI3MjQiLCJEc19DYXJkX0JyYW5kIjoiMSJ9";
const signature = "3Fg6oB4URw8ykL-hkvdYPW4RKvT3ikz6qAv6WMHFH2I=";
const invalidSignature = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa=";

result = pos.checkResponseParameters(merchantParams, signature);
console.log(`VALID checkResponseParameters():
${JSON.stringify(result, null, 2)}
`);

result = pos.checkResponseParameters(merchantParams, invalidSignature);
console.log(`INVALID checkResponseParameters():
${JSON.stringify(result, null, 2)}`);
