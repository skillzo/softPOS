import { Router } from "express";
import { TransactionController } from "../controllers/transactions.controller";

const router = Router();
const transactionController = new TransactionController();

router.get("/health", transactionController.health);
router.post("/transaction", transactionController.createTransaction);
router.get("/transactions", transactionController.getTransactions);
router.get("/transactions/:id", transactionController.getTransactionById);

export default router;
