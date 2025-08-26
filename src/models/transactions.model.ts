import { DatabaseConnection } from "../db/sqlite";
import {
  Transaction,
  TransactionRequest,
  DatabaseRow,
  PaginatedResponse,
} from "../utils/types";
import { logger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

export class TransactionModel {
  private db;

  constructor() {
    const dbConnection = DatabaseConnection.getInstance();
    this.db = dbConnection.getDatabase();
  }

  public async create(
    transactionData: TransactionRequest,
    status: "SUCCESS" | "DECLINED",
    reasonCode?: string,
    reasonMessage?: string
  ): Promise<Transaction> {
    const id = uuidv4();
    const timestamp = new Date();
    const processedAt = new Date();

    const transaction: Transaction = {
      id,
      ...transactionData,
      status,
      reasonCode,
      reasonMessage,
      timestamp,
      processedAt,
    };

    try {
      const stmt = this.db.prepare(`
        INSERT INTO transactions (
          id, cardNumber, expiryMonth, expiryYear, amount, currency,
          merchantId, reference, status, reasonCode, reasonMessage,
          timestamp, processedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        transaction.id,
        transaction.cardNumber,
        transaction.expiryMonth,
        transaction.expiryYear,
        transaction.amount,
        transaction.currency,
        transaction.merchantId,
        transaction.reference,
        transaction.status,
        transaction.reasonCode,
        transaction.reasonMessage,
        transaction.timestamp.toISOString(),
        transaction.processedAt.toISOString()
      );

      logger.info(`Transaction created with ID: ${transaction.id}`);
      return transaction;
    } catch (error) {
      logger.error("Failed to create transaction:", error);
      throw new Error("Failed to create transaction");
    }
  }

  // Get transaction by ID
  public async findById(id: string): Promise<Transaction | null> {
    try {
      const stmt = this.db.prepare("SELECT * FROM transactions WHERE id = ?");
      const row = stmt.get(id) as DatabaseRow;

      if (!row) {
        return null;
      }

      return this.mapRowToTransaction(row);
    } catch (error) {
      logger.error(`Failed to find transaction by ID ${id}:`, error);
      throw new Error("Failed to retrieve transaction");
    }
  }

  public async findAll(
    options: {
      page?: number;
      limit?: number;
      status?: "SUCCESS" | "DECLINED";
      merchantId?: string;
    } = {}
  ): Promise<PaginatedResponse<Transaction>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    try {
      let whereClause = "";
      const params: any[] = [];

      if (options.status) {
        whereClause += " WHERE status = ?";
        params.push(options.status);
      }

      if (options.merchantId) {
        whereClause += whereClause
          ? " AND merchantId = ?"
          : " WHERE merchantId = ?";
        params.push(options.merchantId);
      }

      // Get total count
      const countStmt = this.db.prepare(
        `SELECT COUNT(*) as count FROM transactions${whereClause}`
      );
      const countResult = countStmt.get(...params) as { count: number };
      const total = countResult.count;

      // Get paginated results
      const dataStmt = this.db.prepare(`
        SELECT * FROM transactions${whereClause}
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `);
      const rows = dataStmt.all(...params, limit, offset) as DatabaseRow[];

      const transactions = rows.map((row) => this.mapRowToTransaction(row));

      return {
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Failed to retrieve transactions:", error);
      throw new Error("Failed to retrieve transactions");
    }
  }

  // Get transactions by merchant ID
  public async findByMerchantId(
    merchantId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Transaction>> {
    return this.findAll({ page, limit, merchantId });
  }

  public async getStats(): Promise<{
    total: number;
    successful: number;
    declined: number;
    successRate: number;
  }> {
    try {
      const totalStmt = this.db.prepare(
        "SELECT COUNT(*) as count FROM transactions"
      );
      const stmt = this.db.prepare(
        "SELECT COUNT(*) as count FROM transactions WHERE status = ?"
      );

      const total = (totalStmt.get() as { count: number }).count;
      const successful = (stmt.get("SUCCESS") as { count: number }).count;
      const declined = (stmt.get("DECLINED") as { count: number }).count;

      const successRate = total > 0 ? (successful / total) * 100 : 0;

      return {
        total,
        successful,
        declined,
        successRate: Math.round(successRate * 100) / 100,
      };
    } catch (error) {
      logger.error("Failed to get transaction statistics:", error);
      throw new Error("Failed to retrieve statistics");
    }
  }

  public async referenceExists(
    reference: string,
    merchantId: string
  ): Promise<boolean> {
    try {
      const stmt = this.db.prepare(
        "SELECT COUNT(*) as count FROM transactions WHERE reference = ? AND merchantId = ?"
      );
      const result = stmt.get(reference, merchantId) as { count: number };
      return result.count > 0;
    } catch (error) {
      logger.error("Failed to check reference existence:", error);
      return false;
    }
  }

  private mapRowToTransaction(row: DatabaseRow): Transaction {
    return {
      id: row.id,
      cardNumber: row.cardNumber,
      expiryMonth: row.expiryMonth,
      expiryYear: row.expiryYear,
      amount: row.amount,
      currency: row.currency,
      merchantId: row.merchantId,
      reference: row.reference,
      status: row.status,
      reasonCode: row.reasonCode,
      reasonMessage: row.reasonMessage,
      timestamp: new Date(row.timestamp),
      processedAt: new Date(row.processedAt),
    };
  }
}

export default TransactionModel;
