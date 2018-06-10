const chai = require("chai");
const { expect } = chai;
const RedSys = require("..");
const puppeteer = require("puppeteer");

const MERCHANT_KEY = "sq7HjrUOBfKmC576ILgskD5srU870gJ7";
const MERCHANT_CODE = "327234688";
const TERMINAL = "1";

const pos = new RedSys(MERCHANT_KEY);

describe("RedSys (end to end)", function() {
  this.timeout(25000);

  it("should authorize a correct payment with the testing credit card", async function() {
    var browser;
    try {
      browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();

      const orderReference = generateReferenceNumber();

      var obj = {
        amount: "100", // cents
        orderReference,
        merchantName: "E2E TEST SHOP",
        merchantCode: MERCHANT_CODE,
        currency: RedSys.CURRENCIES.EUR,
        transactionType: RedSys.TRANSACTION_TYPES.AUTHORIZATION,
        terminal: TERMINAL,
        merchantURL: "http://www.my-shop.com/",
        successURL: "http://localhost:8080/success",
        errorURL: "http://localhost:8080/error"
      };
      const req = pos.makePaymentParameters(obj);

      await page.goto(
        `data:text/html,${makeHtmlPayload(
          req.Ds_MerchantParameters,
          req.Ds_Signature
        )}`,
        { waitUntil: "networkidle0" }
      );

      // await new Promise((resolve) => setTimeout(resolve, 10000));
      await page.waitFor("#inputCard");

      await page.type("#inputCard", "4548812049400004");
      await page.type("#cad1", "10");
      await page.type("#cad2", "20");
      await page.type("#codseg", "123");

      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        page.click("#divImgAceptar")
      ]);

      // await new Promise((resolve) => setTimeout(resolve, 2000));
      await page.waitFor(
        '#uno > tbody > tr > td > p > input[type="password"][name="pin"]'
      );
      await page.type(
        '#uno > tbody > tr > td > p > input[type="password"][name="pin"]',
        "123456"
      );

      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        await page.click(
          "#uno > tbody > tr:nth-child(17) > td > p > a:nth-child(1) > img"
        )
      ]);

      await page.waitFor(
        "#body > div.preft > div.col-wr.buttons-wr.right > input.btn.btn-lg.btn-continue"
      );
      await page.click(
        "#body > div.preft > div.col-wr.buttons-wr.right > input.btn.btn-lg.btn-continue"
      );

      await new Promise(resolve => setTimeout(resolve, 500));
      const resultUrl = await page.evaluate("location.href");

      expect(resultUrl).to.be.not.null;

      const matches = resultUrl.match(
        /\?Ds_SignatureVersion=HMAC_SHA256_V1&Ds_MerchantParameters=([^&]+)&Ds_Signature=(.+)$/
      );
      expect(matches).to.be.not.null;
      expect(matches[0]).to.be.not.null;
      expect(matches[1]).to.be.not.null;
      expect(matches[2]).to.be.not.null;

      const merchantParameters = matches[1];
      const signature = matches[2];

      const result = pos.checkResponseParameters(merchantParameters, signature);

      // result = {
      //   "Ds_Date": "10/06/2018",
      //   "Ds_Hour": "21:58",
      //   "Ds_SecurePayment": "1",
      //   "Ds_Amount": "100",
      //   "Ds_Currency": "978",
      //   "Ds_Order": "F858C5C",
      //   "Ds_MerchantCode": "327234688",
      //   "Ds_Terminal": "001",
      //   "Ds_Response": "0000",
      //   "Ds_TransactionType": "0",
      //   "Ds_MerchantData": "",
      //   "Ds_AuthorisationCode": "213672",
      //   "Ds_ConsumerLanguage": "1",
      //   "Ds_Card_Country": "724",
      //   "Ds_Card_Brand": "1"
      // }

      expect(result).to.be.not.null;
      expect(result.Ds_Amount).to.equal(obj.amount);

      expect(result.Ds_Order).to.equal(obj.orderReference);

      expect(result.Ds_Response).to.equal("0000");

      await browser.close();
    } catch (err) {
      console.error(err);
      await browser.close();
    }
  });

  it("payment should fail with a testing credit card", async function() {
    var browser;
    try {
      browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();

      const orderReference = generateReferenceNumber();

      var obj = {
        amount: "100", // cents
        orderReference,
        merchantName: "E2E TEST SHOP",
        merchantCode: MERCHANT_CODE,
        currency: RedSys.CURRENCIES.EUR,
        transactionType: RedSys.TRANSACTION_TYPES.AUTHORIZATION,
        terminal: TERMINAL,
        merchantURL: "http://www.my-shop.com/",
        successURL: "http://localhost:8080/success",
        errorURL: "http://localhost:8080/error"
      };
      const req = pos.makePaymentParameters(obj);

      await page.goto(
        `data:text/html,${makeHtmlPayload(
          req.Ds_MerchantParameters,
          req.Ds_Signature
        )}`,
        { waitUntil: "networkidle0" }
      );

      await page.waitFor("#inputCard");

      await page.type("#inputCard", "1111111111111117");
      await page.type("#cad1", "10");
      await page.type("#cad2", "20");
      // await page.type("#codseg", "123");

      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        page.click("#divImgAceptar")
      ]);

      await page.waitFor(
        "#body > div.preft > div.col-wr.buttons-wr.right > input.btn.btn-lg.btn-continue"
      );

      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        await page.click(
          "#body > div.preft > div.col-wr.buttons-wr.right > input.btn.btn-lg.btn-continue"
        )
      ]);

      await new Promise(resolve => setTimeout(resolve, 500));
      const resultUrl = await page.evaluate("location.href");

      expect(resultUrl).to.be.not.null;

      const matches = resultUrl.match(
        /\?Ds_SignatureVersion=HMAC_SHA256_V1&Ds_MerchantParameters=([^&]+)&Ds_Signature=(.+)$/
      );
      expect(matches).to.be.not.null;
      expect(matches[0]).to.be.not.null;
      expect(matches[1]).to.be.not.null;
      expect(matches[2]).to.be.not.null;

      const merchantParameters = matches[1];
      const signature = matches[2];

      const result = pos.checkResponseParameters(merchantParameters, signature);

      // result = {
      //   Ds_Date: '10/06/2018',
      //   Ds_Hour: '23:58',
      //   Ds_SecurePayment: '0',
      //   Ds_Amount: '100',
      //   Ds_Currency: '978',
      //   Ds_Order: '0D19B40',
      //   Ds_MerchantCode: '327234688',
      //   Ds_Terminal: '001',
      //   Ds_Response: '0180',
      //   Ds_TransactionType: '0',
      //   Ds_MerchantData: '',
      //   Ds_AuthorisationCode: '++++++',
      //   Ds_ConsumerLanguage: '1',
      //   Ds_Card_Country: '0'
      // }

      expect(result).to.be.not.null;
      expect(result.Ds_Amount).to.equal(obj.amount);

      expect(result.Ds_Order).to.equal(obj.orderReference);

      expect(result.Ds_Response).to.equal("0180");
      expect(RedSys.getResponseCodeMessage(result.Ds_Response).trim()).to.equal(
        "Operación no permitida para ese tipo de tarjeta."
      );

      await browser.close();
    } catch (err) {
      console.error(err);
      await browser.close();
    }
  });

  it("should cancel a payment and receive the propper parameters", async function() {
    var browser;
    try {
      browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();

      const orderReference = generateReferenceNumber();

      var obj = {
        amount: "100", // cents
        orderReference,
        merchantName: "E2E TEST SHOP",
        merchantCode: MERCHANT_CODE,
        currency: RedSys.CURRENCIES.EUR,
        transactionType: RedSys.TRANSACTION_TYPES.AUTHORIZATION,
        terminal: TERMINAL,
        merchantURL: "http://www.my-shop.com/",
        successURL: "http://localhost:8080/success",
        errorURL: "http://localhost:8080/error"
      };
      const req = pos.makePaymentParameters(obj);

      await page.goto(
        `data:text/html,${makeHtmlPayload(
          req.Ds_MerchantParameters,
          req.Ds_Signature
        )}`,
        { waitUntil: "networkidle0" }
      );

      await page.waitFor("#divImgCancelar");

      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        page.click("#divImgCancelar")
      ]);

      await page.waitFor(
        "#body > div.preft > div.col-wr.buttons-wr.right > input.btn.btn-lg.btn-continue"
      );

      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        await page.click(
          "#body > div.preft > div.col-wr.buttons-wr.right > input.btn.btn-lg.btn-continue"
        )
      ]);

      await new Promise(resolve => setTimeout(resolve, 500));
      const resultUrl = await page.evaluate("location.href");

      expect(resultUrl).to.be.not.null;

      const matches = resultUrl.match(
        /\?Ds_SignatureVersion=HMAC_SHA256_V1&Ds_MerchantParameters=([^&]+)&Ds_Signature=(.+)$/
      );
      expect(matches).to.be.not.null;
      expect(matches[0]).to.be.not.null;
      expect(matches[1]).to.be.not.null;
      expect(matches[2]).to.be.not.null;

      const merchantParameters = matches[1];
      const signature = matches[2];

      const result = pos.checkResponseParameters(merchantParameters, signature);

      // result = {
      //   Ds_Date: '10/06/2018',
      //   Ds_Hour: '23:47',
      //   Ds_SecurePayment: '0',
      //   Ds_Amount: '100',
      //   Ds_Currency: '978',
      //   Ds_Order: 'C0F1D40',
      //   Ds_MerchantCode: '327234688',
      //   Ds_Terminal: '001',
      //   Ds_Response: '9915',
      //   Ds_TransactionType: '0',
      //   Ds_MerchantData: '',
      //   Ds_AuthorisationCode: '++++++',
      //   Ds_ConsumerLanguage: '1'
      // }

      expect(result).to.be.not.null;
      expect(result.Ds_Response).to.equal("9915");

      await browser.close();
    } catch (err) {
      console.error(err);
      await browser.close();
    }
  });
});

// UTIL

function makeHtmlPayload(Ds_MerchantParameters, Ds_Signature) {
  return `
<html>
<head></head>
<body></body>
<script>
  var form = document.createElement("form");
  form.setAttribute("action", "https://sis-t.redsys.es:25443/sis/realizarPago")
  form.setAttribute("method", "POST");
  form.setAttribute("style", "display: none");
  
  // Parameters
  var field = document.createElement("input");
  field.setAttribute("type", "hidden");
  field.setAttribute("name", "Ds_SignatureVersion");
  field.setAttribute("value", "HMAC_SHA256_V1");
  form.appendChild(field);

  field = document.createElement("input");
  field.setAttribute("type", "hidden");
  field.setAttribute("name", "Ds_MerchantParameters");
  field.setAttribute("value", "${Ds_MerchantParameters}");
  form.appendChild(field);

  field = document.createElement("input");
  field.setAttribute("type", "hidden");
  field.setAttribute("name", "Ds_Signature");
  field.setAttribute("value", "${Ds_Signature}");
  form.appendChild(field);
  
  document.body.appendChild(form);
  form.submit();
</script>
</html>
  `;
}

function generateReferenceNumber() {
  var seed = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F"
  ];
  var result = "",
    rnd;

  for (let i = 0; i < 7; i++) {
    for (let i = 0; i < Math.floor(Math.random() * 1.8e8); i++);
    rnd = Math.floor(Math.random() * seed.length);
    result += seed[rnd];
  }
  return result;
}
