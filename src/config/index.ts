import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  dbPath:
    process.env.DB_PATH || path.join(process.cwd(), "data", "transactions.db"),
  logPath: process.env.LOG_PATH || path.join(process.cwd(), "logs", "logs.log"),
  transactionLogPath:
    process.env.TRANSACTION_LOG_PATH ||
    path.join(process.cwd(), "logs", "transactions.log"),

  supportedCurrencies: ["NGN"],

  responseCodes: {
    INVALID_CARD: "14",
    EXPIRED_CARD: "54",
    INVALID_AMOUNT: "13",
    GENERAL_DECLINE: "05",
    SUCCESS: "00",
  },
} as const;

export default config;
