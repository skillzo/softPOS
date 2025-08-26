import { z } from "zod";
import { validateLuhn } from "../utils/luhn";
import { config } from "../config";

const cardNumberValidation = z
  .string()
  .min(13, "Card number must be at least 13 digits")
  .max(19, "Card number must be at most 19 digits")
  .regex(/^\d+$/, "Card number must contain only digits")
  .refine((cardNumber) => validateLuhn(cardNumber), {
    message: "Invalid card number (failed Luhn check)",
  });

const expiryMonthValidation = z
  .number()
  .int("Expiry month must be an integer")
  .min(1, "Expiry month must be between 1 and 12")
  .max(12, "Expiry month must be between 1 and 12");

const expiryYearValidation = z
  .number()
  .int("Expiry year must be an integer")
  .min(new Date().getFullYear(), "Card has expired")
  .max(new Date().getFullYear() + 20, "Expiry year is too far in the future");

const amountValidation = z
  .number()
  .positive("Amount must be greater than 0")
  .max(999999.99, "Amount exceeds maximum allowed");

const currencyValidation = z
  .string()
  .length(3, "Currency must be a 3-letter ISO code")
  .regex(/^[A-Z]{3}$/, "Currency must be uppercase letters only")
  .refine(
    (currency) =>
      (config.supportedCurrencies as readonly string[]).includes(currency),
    {
      message: `Currency must be one of: ${config.supportedCurrencies.join(
        ", "
      )}`,
    }
  );

const merchantIdValidation = z
  .string()
  .min(1, "Merchant ID is required")
  .max(20, "Merchant ID must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Merchant ID can only contain letters, numbers, underscores, and hyphens"
  );

const referenceValidation = z
  .string()
  .min(1, "Reference is required")
  .max(50, "Reference must be at most 50 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Reference can only contain letters, numbers, underscores, and hyphens"
  );

export const transactionRequestSchema = z.object({
  cardNumber: cardNumberValidation,
  expiryMonth: expiryMonthValidation,
  expiryYear: expiryYearValidation,
  amount: amountValidation,
  currency: currencyValidation,
  merchantId: merchantIdValidation,
  reference: referenceValidation,
});

export function validateTransactionRequest(data: unknown) {
  return transactionRequestSchema.safeParse(data);
}

export default {
  transactionRequestSchema,
  validateTransactionRequest,
};
