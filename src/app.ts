import express from "express";
import cors from "cors";
import transactionRoutes from "./routes/transactions.routes";

export function createApp(): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/", transactionRoutes);

  return app;
}

export default createApp;
