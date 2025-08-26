import { Request, Response } from "express";
import { TransactionService } from "../services/transactions.service";
import { validateLuhn } from "../utils/luhn";
import { logTransaction } from "../utils/logger";
import { config } from "../config";

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  public health = (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  };

  public createTransaction = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {
        cardNumber,
        expiryMonth,
        expiryYear,
        amount,
        currency,
        merchantId,
        reference,
      } = req.body;

      // Basic validation
      if (
        !cardNumber ||
        !expiryMonth ||
        !expiryYear ||
        !amount ||
        !currency ||
        !merchantId ||
        !reference
      ) {
        res.status(400).json({
          status: "DECLINED",
          reasonCode: config.responseCodes.GENERAL_DECLINE,
          message: "Missing required fields",
        });
        return;
      }

      // Currency validation
      if (!config.supportedCurrencies.includes(currency)) {
        res.status(400).json({
          status: "DECLINED",
          reasonCode: config.responseCodes.GENERAL_DECLINE,
          message: "Unsupported currency",
        });
        return;
      }

      // Card validation
      if (!validateLuhn(cardNumber)) {
        logTransaction("DECLINED", {
          merchantId,
          reference,
          reason: "Invalid card",
        });
        res.status(400).json({
          status: "DECLINED",
          reasonCode: config.responseCodes.INVALID_CARD,
          message: "Invalid card number",
        });
        return;
      }

      // Expiry validation
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      if (
        expiryYear < currentYear ||
        (expiryYear === currentYear && expiryMonth < currentMonth)
      ) {
        logTransaction("DECLINED", {
          merchantId,
          reference,
          reason: "Card expired",
        });
        res.status(400).json({
          status: "DECLINED",
          reasonCode: config.responseCodes.EXPIRED_CARD,
          message: "Card expired",
        });
        return;
      }

      // Amount validation
      if (amount <= 0) {
        logTransaction("DECLINED", {
          merchantId,
          reference,
          reason: "Invalid amount",
        });
        res.status(400).json({
          status: "DECLINED",
          reasonCode: config.responseCodes.INVALID_AMOUNT,
          message: "Invalid amount",
        });
        return;
      }

      const result = await this.transactionService.processTransaction(req.body);
      logTransaction("SUCCESS", { merchantId, reference, amount, currency });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Transaction processing failed" });
    }
  };

  public getTransactions = async (req: Request, res: Response) => {
    try {
      const { status, merchantId, page = 1, limit = 10 } = req.query;
      const result = await this.transactionService.getTransactions({
        status: status as any,
        merchantId: merchantId as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve transactions" });
    }
  };

  public getTransactionById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const transaction = await this.transactionService.getTransactionById(id);

      if (!transaction) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve transaction" });
    }
  };
}

export default TransactionController;
