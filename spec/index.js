const chai = require("chai");
const RedSys = require("..");

const { expect } = chai;
const secretKey = "sq7HjrUOBfKmC576ILgskD5srU870gJ7";

describe("RedSys POS", () => {
  var redsys;
  before(() => {
    redsys = new RedSys(secretKey);
  });

  describe("init", () => {
    it("should enforce the secret key constructor parameter", () => {
      expect(() => {
        new RedSys();
      }).to.throw();
    });
  });

  describe("crypto", () => {
    it("should match the expected 3DES encryption result", () => {
      expect(redsys.encrypt("")).to.equal("");
      expect(redsys.encrypt("0")).to.equal("Qyx5NZhbucY=");
      expect(redsys.encrypt("1234567890")).to.equal("ntVrJPxp2xlsetWVajPl0g==");
      expect(redsys.encrypt("ABCDEFGHIJKLMNOPQRSTUVWXYZ")).to.equal(
        "zpFLv7NacMPOXx570s2BAdR9fZue1crKaHX2S/0/f/8="
      );
    });
    it("should match the expected HMAC 256 signature", () => {
      const derivateKey = redsys.encrypt("1234567890");

      expect(redsys.sign("", derivateKey)).to.equal(
        "IbxBdJyVLrE5WaBnqWx7c2Y8DMFIZq5u6/4IxqmJJnY="
      );
      expect(redsys.sign("0", derivateKey)).to.equal(
        "atZyAzLQQwcYi/3inEzi9eVflxJbAFUG/zy5JFittzs="
      );
      expect(redsys.sign("1234567890", derivateKey)).to.equal(
        "/MBsym0YkgxF+9YwU0lqs6NDU+uEXQ93DQMYYzvhXvI="
      );
      expect(redsys.sign("ABCDEFGHIJKLMNOPQRSTUVWXYZ", derivateKey)).to.equal(
        "GE/JQv/dmzqHleoAto1Vt2gbPYvXBlj4ighJIeF0LXs="
      );
    });
  });

  describe("RedSys request parameters", () => {
    it("should generate a valid object with request parameters", () => {
      var params = {
        amount: "1000",
        orderReference: "12345678",
        merchantName: "SPEC SHOP",
        merchantCode: "327234688",
        currency: RedSys.CURRENCIES.EUR,
        transactionType: RedSys.TRANSACTION_TYPES.AUTHORIZATION,
        terminal: "1",
        merchantURL: "http://www.spec-shop.com/",
        successURL: "http://www.spec-shop/success",
        errorURL: "http://www.spec-shop/error"
      };

      expect(redsys.makePaymentParameters(params)).to.deep.equal({
        Ds_SignatureVersion: "HMAC_SHA256_V1",
        Ds_MerchantParameters:
          "eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxMDAwIiwiRFNfTUVSQ0hBTlRfT1JERVIiOiIxMjM0NTY3OCIsIkRTX01FUkNIQU5UX01FUkNIQU5UTkFNRSI6IlNQRUMgU0hPUCIsIkRTX01FUkNIQU5UX01FUkNIQU5UQ09ERSI6IjMyNzIzNDY4OCIsIkRTX01FUkNIQU5UX0NVUlJFTkNZIjoiOTc4IiwiRFNfTUVSQ0hBTlRfVFJBTlNBQ1RJT05UWVBFIjoiMCIsIkRTX01FUkNIQU5UX1RFUk1JTkFMIjoiMSIsIkRTX01FUkNIQU5UX01FUkNIQU5UVVJMIjoiaHR0cDovL3d3dy5zcGVjLXNob3AuY29tLyIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cDovL3d3dy5zcGVjLXNob3Avc3VjY2VzcyIsIkRTX01FUkNIQU5UX1VSTEtPIjoiaHR0cDovL3d3dy5zcGVjLXNob3AvZXJyb3IifQ==",
        Ds_Signature: "OJHmZ7cVCM2YdKoFUWkSvK9suPLRvl3DPS840EgBW00="
      });

      params.amount = "1500";
      expect(redsys.makePaymentParameters(params)).to.deep.equal({
        Ds_SignatureVersion: "HMAC_SHA256_V1",
        Ds_MerchantParameters:
          "eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxNTAwIiwiRFNfTUVSQ0hBTlRfT1JERVIiOiIxMjM0NTY3OCIsIkRTX01FUkNIQU5UX01FUkNIQU5UTkFNRSI6IlNQRUMgU0hPUCIsIkRTX01FUkNIQU5UX01FUkNIQU5UQ09ERSI6IjMyNzIzNDY4OCIsIkRTX01FUkNIQU5UX0NVUlJFTkNZIjoiOTc4IiwiRFNfTUVSQ0hBTlRfVFJBTlNBQ1RJT05UWVBFIjoiMCIsIkRTX01FUkNIQU5UX1RFUk1JTkFMIjoiMSIsIkRTX01FUkNIQU5UX01FUkNIQU5UVVJMIjoiaHR0cDovL3d3dy5zcGVjLXNob3AuY29tLyIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cDovL3d3dy5zcGVjLXNob3Avc3VjY2VzcyIsIkRTX01FUkNIQU5UX1VSTEtPIjoiaHR0cDovL3d3dy5zcGVjLXNob3AvZXJyb3IifQ==",
        Ds_Signature: "+FOvVhtCE7m+mLMecrj/sftU7B7GaWVxkATvswnDJgw="
      });

      params.orderReference = "00001234";
      expect(redsys.makePaymentParameters(params)).to.deep.equal({
        Ds_SignatureVersion: "HMAC_SHA256_V1",
        Ds_MerchantParameters:
          "eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxNTAwIiwiRFNfTUVSQ0hBTlRfT1JERVIiOiIwMDAwMTIzNCIsIkRTX01FUkNIQU5UX01FUkNIQU5UTkFNRSI6IlNQRUMgU0hPUCIsIkRTX01FUkNIQU5UX01FUkNIQU5UQ09ERSI6IjMyNzIzNDY4OCIsIkRTX01FUkNIQU5UX0NVUlJFTkNZIjoiOTc4IiwiRFNfTUVSQ0hBTlRfVFJBTlNBQ1RJT05UWVBFIjoiMCIsIkRTX01FUkNIQU5UX1RFUk1JTkFMIjoiMSIsIkRTX01FUkNIQU5UX01FUkNIQU5UVVJMIjoiaHR0cDovL3d3dy5zcGVjLXNob3AuY29tLyIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cDovL3d3dy5zcGVjLXNob3Avc3VjY2VzcyIsIkRTX01FUkNIQU5UX1VSTEtPIjoiaHR0cDovL3d3dy5zcGVjLXNob3AvZXJyb3IifQ==",
        Ds_Signature: "PDXnm3w6XoMCu9LH8qr4fH3lZixclxO75yV3lHZWBZk="
      });

      params.merchantName = "TEST SHOP";
      expect(redsys.makePaymentParameters(params)).to.deep.equal({
        Ds_SignatureVersion: "HMAC_SHA256_V1",
        Ds_MerchantParameters:
          "eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxNTAwIiwiRFNfTUVSQ0hBTlRfT1JERVIiOiIwMDAwMTIzNCIsIkRTX01FUkNIQU5UX01FUkNIQU5UTkFNRSI6IlRFU1QgU0hPUCIsIkRTX01FUkNIQU5UX01FUkNIQU5UQ09ERSI6IjMyNzIzNDY4OCIsIkRTX01FUkNIQU5UX0NVUlJFTkNZIjoiOTc4IiwiRFNfTUVSQ0hBTlRfVFJBTlNBQ1RJT05UWVBFIjoiMCIsIkRTX01FUkNIQU5UX1RFUk1JTkFMIjoiMSIsIkRTX01FUkNIQU5UX01FUkNIQU5UVVJMIjoiaHR0cDovL3d3dy5zcGVjLXNob3AuY29tLyIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cDovL3d3dy5zcGVjLXNob3Avc3VjY2VzcyIsIkRTX01FUkNIQU5UX1VSTEtPIjoiaHR0cDovL3d3dy5zcGVjLXNob3AvZXJyb3IifQ==",
        Ds_Signature: "k6vi0facQB5Wm2FsxQiUpDoyW7Arz2Del+P2Wej+dN4="
      });
    });
  });

  describe("RedSys response decoding and validating", () => {
    it("should decode valid responses", () => {
      var merchantParams =
        "eyJEc19EYXRlIjoiMjglMkYwNSUyRjIwMTgiLCJEc19Ib3VyIjoiMTAlM0E0NCIsIkRzX1NlY3VyZVBheW1lbnQiOiIxIiwiRHNfQW1vdW50IjoiNjcwMCIsIkRzX0N1cnJlbmN5IjoiOTc4IiwiRHNfT3JkZXIiOiIwMDAwRkI5QTE3MiIsIkRzX01lcmNoYW50Q29kZSI6IjMzNjcwNDY1NSIsIkRzX1Rlcm1pbmFsIjoiMDAxIiwiRHNfUmVzcG9uc2UiOiIwMDAwIiwiRHNfVHJhbnNhY3Rpb25UeXBlIjoiMCIsIkRzX01lcmNoYW50RGF0YSI6IiIsIkRzX0F1dGhvcmlzYXRpb25Db2RlIjoiMjE4MDQ4IiwiRHNfQ29uc3VtZXJMYW5ndWFnZSI6IjEiLCJEc19DYXJkX0NvdW50cnkiOiI3MjQiLCJEc19DYXJkX0JyYW5kIjoiMSJ9";
      const signature = "3Fg6oB4URw8ykL-hkvdYPW4RKvT3ikz6qAv6WMHFH2I=";

      expect(
        redsys.checkResponseParameters(merchantParams, signature)
      ).to.deep.equal({
        Ds_Date: "28/05/2018",
        Ds_Hour: "10:44",
        Ds_SecurePayment: "1",
        Ds_Amount: "6700",
        Ds_Currency: "978",
        Ds_Order: "0000FB9A172",
        Ds_MerchantCode: "336704655",
        Ds_Terminal: "001",
        Ds_Response: "0000",
        Ds_TransactionType: "0",
        Ds_MerchantData: "",
        Ds_AuthorisationCode: "218048",
        Ds_ConsumerLanguage: "1",
        Ds_Card_Country: "724",
        Ds_Card_Brand: "1"
      });
    });

    it("should throw without a signature", () => {
      const merchantParams =
        "eyJEc19EYXRlIjoiMjglMkYwNSUyRjIwMTgiLCJEc19Ib3VyIjoiMTAlM0E0NCIsIkRzX1NlY3VyZVBheW1lbnQiOiIxIiwiRHNfQW1vdW50IjoiNjcwMCIsIkRzX0N1cnJlbmN5IjoiOTc4IiwiRHNfT3JkZXIiOiIwMDAwRkI5QTE3MiIsIkRzX01lcmNoYW50Q29kZSI6IjMzNjcwNDY1NSIsIkRzX1Rlcm1pbmFsIjoiMDAxIiwiRHNfUmVzcG9uc2UiOiIwMDAwIiwiRHNfVHJhbnNhY3Rpb25UeXBlIjoiMCIsIkRzX01lcmNoYW50RGF0YSI6IiIsIkRzX0F1dGhvcmlzYXRpb25Db2RlIjoiMjE4MDQ4IiwiRHNfQ29uc3VtZXJMYW5ndWFnZSI6IjEiLCJEc19DYXJkX0NvdW50cnkiOiI3MjQiLCJEc19DYXJkX0JyYW5kIjoiMSJ9";
      expect(() => {
        redsys.checkResponseParameters(merchantParams, "");
      }).to.throw();
    });

    it("should return 'null' with an invalid signature", () => {
      const merchantParams =
        "eyJEc19EYXRlIjoiMjglMkYwNSUyRjIwMTgiLCJEc19Ib3VyIjoiMTAlM0E0NCIsIkRzX1NlY3VyZVBheW1lbnQiOiIxIiwiRHNfQW1vdW50IjoiNjcwMCIsIkRzX0N1cnJlbmN5IjoiOTc4IiwiRHNfT3JkZXIiOiIwMDAwRkI5QTE3MiIsIkRzX01lcmNoYW50Q29kZSI6IjMzNjcwNDY1NSIsIkRzX1Rlcm1pbmFsIjoiMDAxIiwiRHNfUmVzcG9uc2UiOiIwMDAwIiwiRHNfVHJhbnNhY3Rpb25UeXBlIjoiMCIsIkRzX01lcmNoYW50RGF0YSI6IiIsIkRzX0F1dGhvcmlzYXRpb25Db2RlIjoiMjE4MDQ4IiwiRHNfQ29uc3VtZXJMYW5ndWFnZSI6IjEiLCJEc19DYXJkX0NvdW50cnkiOiI3MjQiLCJEc19DYXJkX0JyYW5kIjoiMSJ9";
      expect(redsys.checkResponseParameters(merchantParams, "00000")).to.be
        .null;
      expect(redsys.checkResponseParameters(merchantParams, "12345")).to.be
        .null;
      expect(redsys.checkResponseParameters(merchantParams, "12345==")).to.be
        .null;
    });
  });
});
