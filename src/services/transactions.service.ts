import { TransactionModel } from "../models/transactions.model";
import { TransactionRequest, Transaction } from "../utils/types";

export class TransactionService {
  private transactionModel: TransactionModel;

  constructor() {
    this.transactionModel = new TransactionModel();
  }

  public async processTransaction(transactionData: TransactionRequest) {
    // Check if reference already exists for this merchant
    const referenceExists = await this.transactionModel.referenceExists(
      transactionData.reference,
      transactionData.merchantId
    );

    if (referenceExists) {
      const transaction = await this.transactionModel.create(
        transactionData,
        "DECLINED",
        "05",
        "Duplicate transaction reference"
      );
      return {
        status: "DECLINED",
        reasonCode: "05",
        message: "Duplicate transaction reference",
        transaction,
      };
    }

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
