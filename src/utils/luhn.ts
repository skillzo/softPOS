export function validateLuhn(cardNumber: string): boolean {
  if (!cardNumber || typeof cardNumber !== "string") {
    return false;
  }

  const cleanedNumber = cardNumber.replace(/\D/g, "");

  if (cleanedNumber.length < 13 || cleanedNumber.length > 19) {
    return false;
  }

  const digits = cleanedNumber.split("").map(Number);

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];

    if (isEven) {
      digit *= 2;
      // If the result is greater than 9, subtract 9
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  // The number is valid if the sum is divisible by 10
  return sum % 10 === 0;
}

// solely used for testing
export function generateLuhnValid(prefix: string, length: number): string {
  if (length < 13 || length > 19) {
    throw new Error("Card number length must be between 13 and 19 digits");
  }

  if (prefix.length >= length) {
    throw new Error("Prefix length must be less than total length");
  }

  // Generate random digits for the middle portion
  let cardNumber = prefix;
  const remainingDigits = length - prefix.length - 1; // -1 for check digit

  for (let i = 0; i < remainingDigits; i++) {
    cardNumber += Math.floor(Math.random() * 10).toString();
  }

  // Calculate check digit
  const checkDigit = calculateLuhnCheckDigit(cardNumber);
  cardNumber += checkDigit.toString();

  return cardNumber;
}

export function calculateLuhnCheckDigit(partialNumber: string): number {
  const cleanedNumber = partialNumber.replace(/\D/g, "");
  const digits = cleanedNumber.split("").map(Number);

  let sum = 0;
  let isEven = true;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }
  return (10 - (sum % 10)) % 10;
}

export function getCardType(cardNumber: string): string {
  const cleanedNumber = cardNumber.replace(/\D/g, "");

  // Only Visa and Mastercard accepted in Nigeria
  if (/^4/.test(cleanedNumber)) {
    return "Visa";
  } else if (
    /^5[1-5]/.test(cleanedNumber) ||
    /^2(2[2-9]|[3-6]|7[0-1]|720)/.test(cleanedNumber)
  ) {
    return "Mastercard";
  }

  return "Unsupported";
}

/**
 * Masks a credit card number for logging/display purposes
 * @param cardNumber - The credit card number
 * @param showLast - Number of digits to show at the end (default: 4)
 * @returns string - The masked card number
 */
export function maskCardNumber(
  cardNumber: string,
  showLast: number = 4
): string {
  const cleanedNumber = cardNumber.replace(/\D/g, "");

  if (cleanedNumber.length <= showLast) {
    return "*".repeat(cleanedNumber.length);
  }

  const maskedPortion = "*".repeat(cleanedNumber.length - showLast);
  const visiblePortion = cleanedNumber.slice(-showLast);

  return maskedPortion + visiblePortion;
}

/**
 * Formats a credit card number with spaces for better readability
 * @param cardNumber - The credit card number
 * @returns string - The formatted card number
 */
export function formatCardNumber(cardNumber: string): string {
  const cleanedNumber = cardNumber.replace(/\D/g, "");

  // Different formatting for different card types
  const cardType = getCardType(cleanedNumber);

  if (cardType === "American Express") {
    // AmEx: 4-6-5 format
    return cleanedNumber.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
  } else {
    // Most cards: 4-4-4-4 format
    return cleanedNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
  }
}

// Test data for development and testing
export const testCards = {
  visa: {
    valid: ["4111111111111111", "4012888888881881", "4222222222222"],
    invalid: ["4111111111111112", "4012888888881882"],
  },
  mastercard: {
    valid: ["5555555555554444", "5105105105105100"],
    invalid: ["5555555555554445", "5105105105105101"],
  },
} as const;
