import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { config } from "../config";
import { logger } from "../utils/logger";

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db!: Database.Database;

  private constructor() {
    this.initializeDatabase();
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  private initializeDatabase(): void {
    try {
      // Ensure the database directory exists
      const dbDir = path.dirname(config.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        logger.info(`Created database directory: ${dbDir}`);
      }

      // Initialize SQLite database
      this.db = new Database(config.dbPath);
      this.db.pragma("journal_mode = WAL");
      this.db.pragma("foreign_keys = ON");

      logger.info(`Connected to SQLite database: ${config.dbPath}`);

      // Create tables
      this.createTables();
    } catch (error) {
      logger.error("Failed to initialize database:", error);
      throw new Error("Database initialization failed");
    }
  }

  private createTables(): void {
    const createTransactionsTable = `
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        cardNumber TEXT NOT NULL,
        expiryMonth INTEGER NOT NULL,
        expiryYear INTEGER NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        merchantId TEXT NOT NULL,
        reference TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'DECLINED')),
        reasonCode TEXT,
        reasonMessage TEXT,
        timestamp TEXT NOT NULL,
        processedAt TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
      CREATE INDEX IF NOT EXISTS idx_transactions_merchantId ON transactions(merchantId);
      CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
      CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);
    `;

    try {
      this.db.exec(createTransactionsTable);
      this.db.exec(createIndexes);
      logger.info("Database tables and indexes created successfully");
    } catch (error) {
      logger.error("Failed to create database tables:", error);
      throw new Error("Table creation failed");
    }
  }

  public getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db;
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      logger.info("Database connection closed");
    }
  }

  // Health check method
  public async healthCheck(): Promise<boolean> {
    try {
      const result = this.db.prepare("SELECT 1 as health").get();
      return result !== undefined;
    } catch (error) {
      logger.error("Database health check failed:", error);
      return false;
    }
  }

  // Get database statistics
  public getStats(): any {
    try {
      const transactionCount = this.db
        .prepare("SELECT COUNT(*) as count FROM transactions")
        .get() as { count: number };
      const successCount = this.db
        .prepare("SELECT COUNT(*) as count FROM transactions WHERE status = ?")
        .get("SUCCESS") as { count: number };
      const declinedCount = this.db
        .prepare("SELECT COUNT(*) as count FROM transactions WHERE status = ?")
        .get("DECLINED") as { count: number };

      return {
        totalTransactions: transactionCount?.count || 0,
        successfulTransactions: successCount?.count || 0,
        declinedTransactions: declinedCount?.count || 0,
      };
    } catch (error) {
      logger.error("Failed to get database stats:", error);
      return null;
    }
  }
}

// Export singleton instance
export const dbConnection = DatabaseConnection.getInstance();
