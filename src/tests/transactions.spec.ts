import {
  validateLuhn,
  generateLuhnValid,
  getCardType,
  maskCardNumber,
  formatCardNumber,
  testCards,
} from "../utils/luhn";
import { validateTransactionRequest } from "../validators/transactions.schema";
import { TransactionRequest } from "../utils/types";

describe("Luhn Algorithm Tests", () => {
  describe("validateLuhn", () => {
    test("should validate correct Visa card numbers", () => {
      testCards.visa.valid.forEach((cardNumber) => {
        expect(validateLuhn(cardNumber)).toBe(true);
      });
    });

    test("should invalidate incorrect Visa card numbers", () => {
      testCards.visa.invalid.forEach((cardNumber) => {
        expect(validateLuhn(cardNumber)).toBe(false);
      });
    });

    test("should validate correct Mastercard numbers", () => {
      testCards.mastercard.valid.forEach((cardNumber) => {
        expect(validateLuhn(cardNumber)).toBe(true);
      });
    });

    test("should invalidate incorrect Mastercard numbers", () => {
      testCards.mastercard.invalid.forEach((cardNumber) => {
        expect(validateLuhn(cardNumber)).toBe(false);
      });
    });

    test("should handle empty string", () => {
      expect(validateLuhn("")).toBe(false);
    });

    test("should handle non-numeric characters by removing them", () => {
      expect(validateLuhn("4111-1111-1111-1111")).toBe(true);
      expect(validateLuhn("4111 1111 1111 1111")).toBe(true);
    });

    test("should invalidate numbers that are too short", () => {
      expect(validateLuhn("411111111111")).toBe(false); // 12 digits
    });

    test("should invalidate numbers that are too long", () => {
      expect(validateLuhn("41111111111111111111")).toBe(false); // 20 digits
    });
  });

  describe("getCardType", () => {
    test("should identify Visa cards", () => {
      expect(getCardType("4111111111111111")).toBe("Visa");
      expect(getCardType("4012888888881881")).toBe("Visa");
    });

    test("should identify Mastercard", () => {
      expect(getCardType("5555555555554444")).toBe("Mastercard");
      expect(getCardType("5105105105105100")).toBe("Mastercard");
    });

    test("should return Unsupported for other cards", () => {
      expect(getCardType("378282246310005")).toBe("Unsupported"); // Amex
      expect(getCardType("1234567890123456")).toBe("Unsupported");
    });
  });

  describe("maskCardNumber", () => {
    test("should mask card number with default last 4 digits", () => {
      expect(maskCardNumber("4111111111111111")).toBe("************1111");
    });

    test("should mask card number with custom last digits", () => {
      expect(maskCardNumber("4111111111111111", 6)).toBe("**********111111");
    });
  });

  describe("formatCardNumber", () => {
    test("should format Visa card with spaces", () => {
      expect(formatCardNumber("4111111111111111")).toBe("4111 1111 1111 1111");
    });
  });
});

describe("Transaction Validation Tests", () => {
  const validTransactionData: TransactionRequest = {
    cardNumber: "4111111111111111",
    expiryMonth: 12,
    expiryYear: new Date().getFullYear() + 1,
    amount: 99.99,
    currency: "NGN",
    merchantId: "MERCHANT001",
    reference: "TXN12345",
  };

  describe("validateTransactionRequest", () => {
    test("should validate correct transaction data", () => {
      const result = validateTransactionRequest(validTransactionData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validTransactionData);
      }
    });

    test("should invalidate missing required fields", () => {
      const invalidData = { ...validTransactionData };
      delete (invalidData as any).cardNumber;

      const result = validateTransactionRequest(invalidData);
      expect(result.success).toBe(false);
    });

    test("should invalidate invalid card number", () => {
      const invalidData = {
        ...validTransactionData,
        cardNumber: "4111111111111112", // Invalid Luhn
      };

      const result = validateTransactionRequest(invalidData);
      expect(result.success).toBe(false);
    });

    test("should invalidate expired card", () => {
      const invalidData = {
        ...validTransactionData,
        expiryMonth: 1,
        expiryYear: new Date().getFullYear() - 1,
      };

      const result = validateTransactionRequest(invalidData);
      expect(result.success).toBe(false);
    });

    test("should invalidate negative amount", () => {
      const invalidData = {
        ...validTransactionData,
        amount: -10.0,
      };

      const result = validateTransactionRequest(invalidData);
      expect(result.success).toBe(false);
    });

    test("should invalidate unsupported currency", () => {
      const invalidData = {
        ...validTransactionData,
        currency: "USD",
      };

      const result = validateTransactionRequest(invalidData);
      expect(result.success).toBe(false);
    });

    test("should validate NGN currency", () => {
      const result = validateTransactionRequest(validTransactionData);
      expect(result.success).toBe(true);
    });
  });
});
