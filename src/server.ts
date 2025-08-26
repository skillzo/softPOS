import { createApp } from "./app";
import { config } from "./config";
import { logger } from "./utils/logger";
import { dbConnection } from "./db/sqlite";

async function startServer(): Promise<void> {
  try {
    logger.info("Initializing database connection...");
    const dbHealthy = await dbConnection.healthCheck();

    if (!dbHealthy) {
      throw new Error("Database health check failed");
    }

    logger.info("Database connected");

    // Create Express application
    const app = createApp();

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(
        `🚀 SoftPOS Transaction Handler started on port ${config.port}`
      );
      logger.info("Available endpoints:", {
        health: `http://localhost:${config.port}/health`,
        transaction: `http://localhost:${config.port}/transaction`,
        transactions: `http://localhost:${config.port}/transactions`,
      });
    });

    // Handle server errors
    server.on("error", (error: any) => {
      if (error.syscall !== "listen") {
        throw error;
      }

      const bind =
        typeof config.port === "string"
          ? "Pipe " + config.port
          : "Port " + config.port;

      switch (error.code) {
        case "EACCES":
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case "EADDRINUSE":
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error: any) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer().catch((error) => {
    logger.error("Unhandled error during server startup:", error);
    process.exit(1);
  });
}

export { startServer };
