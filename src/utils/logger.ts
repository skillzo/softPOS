import winston from "winston";
import { config } from "../config";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

export const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: config.logPath }),
    new winston.transports.Console(),
  ],
});

export const transactionLogger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: config.transactionLogPath }),
  ],
});

export const logTransaction = (type: string, data: any) => {
  const message = `${type}: ${JSON.stringify(data)}`;
  logger.info(message);
  transactionLogger.info(message);
};

export default logger;
