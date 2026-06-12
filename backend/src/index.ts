import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { securityHeaders, apiLimiter } from "./middlewares/security.js";
import { errorHandler } from "./middlewares/error.js";
import logger from "./utils/logger.js";
import { NotFoundError } from "./utils/errors.js";

// Import API Routers
import authRoutes from "./routes/auth.js";
import invoicesRouter from "./routes/invoices.js";
import contractsRouter from "./routes/contracts.js";
import buyersRouter from "./routes/buyers.js";
import analyticsRouter from "./routes/analytics.js";
import negotiationsRouter from "./routes/negotiations.js";
import aiRouter from "./routes/ai.js";
import uploadRouter from "./routes/upload.js";
import dashboardRouter from "./routes/dashboard.js";

import { initializeFirebase } from "./firebase/firebase-admin.js";

console.log("SERVER_BOOT");

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// ==========================================
// CORE MIDDLEWARES
// ==========================================

app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

// Parse JSON payload and limit payload size to prevent DOS
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Wire security configurations
app.use(securityHeaders);
app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? [process.env.CLIENT_URL]
      : [],
    credentials: true,
  })
);
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
    status: "healthy"
  });
});

app.get(
  "/health",
  (_, res) =>
    res.status(200)
      .json({
        status: "healthy"
      })
);

// ==========================================
// API ROUTES
// ==========================================
app.use("/api/auth", authRoutes);
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
function startServer() {
  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(`Listening ${PORT}`);
      console.log("APP_LISTEN");
      logger.info(`🚀 PayBridge API running on port ${PORT}`);
      logger.info(`Mode: ${process.env.NODE_ENV || "production"}`);
      
      // Initialize Firebase Admin SDK lazily after the server is up and listening
      initializeFirebase();
    }
  );
}

try {
  startServer();
} catch (e) {
  console.error(e);
  process.exit(1);
}
