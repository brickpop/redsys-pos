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

const result = sabadellPOS.makePaymentParameters(obj);
console.log(result);
