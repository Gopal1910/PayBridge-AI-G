import "dotenv/config";
import express from "express";
import morgan from "morgan";
import { securityHeaders, corsOptions, apiLimiter } from "./middlewares/security.js";
import { errorHandler } from "./middlewares/error.js";
import logger from "./utils/logger.js";
import { NotFoundError } from "./utils/errors.js";

// Import API Routers
import authRouter from "./routes/auth.js";
import invoicesRouter from "./routes/invoices.js";
import contractsRouter from "./routes/contracts.js";
import buyersRouter from "./routes/buyers.js";
import analyticsRouter from "./routes/analytics.js";
import negotiationsRouter from "./routes/negotiations.js";
import aiRouter from "./routes/ai.js";
import uploadRouter from "./routes/upload.js";
import dashboardRouter from "./routes/dashboard.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// CORE MIDDLEWARES
// ==========================================

// Parse JSON payload and limit payload size to prevent DOS
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Wire security configurations
app.use(securityHeaders);
app.use(corsOptions);
app.use(apiLimiter);

// Configure HTTP logger
app.use(
  morgan("combined", {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  })
);

// ==========================================
// SYSTEM CHECK ENDPOINTS
// ==========================================

// Base healthcheck
app.get("/", (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "PayBridge AI Backend Service is running.",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime()
  });
});

// ==========================================
// API ROUTES
// ==========================================
app.use("/api/auth", authRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/contracts", contractsRouter);
app.use("/api/buyers", buyersRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/negotiations", negotiationsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/dashboard", dashboardRouter);

// ==========================================
// FALLBACK & ERROR MIDDLEWARES
// ==========================================

// Handle unknown route 404s
app.use("*", (req, res, next) => {
  next(new NotFoundError(`Requested API Route ${req.originalUrl} not found.`));
});

// Attach global error handler (Must be the last mounted middleware)
app.use(errorHandler);

// ==========================================
// SERVER INITIALIZATION
// ==========================================
app.listen(PORT, () => {
  logger.info(`🚀 PayBridge AI API running on http://localhost:${PORT}`);
  logger.info(`Mode: ${process.env.NODE_ENV || "development"}`);
});
