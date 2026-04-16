import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { generalLimiter } from "./middleware/rateLimiter.middleware.js";

// Import routes
import authRoutes from "./modules/auth/auth.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import accountRoutes from "./modules/account/account.routes.js";
import transactionRoutes from "./modules/transaction/transaction.routes.js";
import budgetRoutes from "./modules/budget/budget.routes.js";
import reportRoutes from "./modules/report/report.routes.js";

const app = express();

// === Global Middleware ===
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(generalLimiter);

// === Health Check ===
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// === Routes ===
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);

// === Error Handler (harus paling akhir) ===
app.use(errorHandler);

export default app;
