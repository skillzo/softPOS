import { TransactionModel } from "../models/transactions.model";
import { TransactionRequest, Transaction } from "../utils/types";

export class TransactionService {
  private transactionModel: TransactionModel;

  constructor() {
    this.transactionModel = new TransactionModel();
  }

  public async processTransaction(transactionData: TransactionRequest) {
    const transaction = await this.transactionModel.create(
      transactionData,
      "SUCCESS"
    );
    return {
      status: "SUCCESS",
      transaction,
    };
  }

  public async getTransactionById(id: string): Promise<Transaction | null> {
    return await this.transactionModel.findById(id);
  }

  public async getTransactions(
    options: {
      page?: number;
      limit?: number;
      status?: "SUCCESS" | "DECLINED";
      merchantId?: string;
    } = {}
  ) {
    return await this.transactionModel.findAll(options);
  }
}

export default TransactionService;
