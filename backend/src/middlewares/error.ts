import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import logger from "../utils/logger.js";

/**
 * Express Global Error Handling Middleware.
 * Captures custom AppErrors and unexpected server exceptions.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // If headers already sent, delegate to standard Express handler
  if (res.headersSent) {
    return next(err);
  }

  const isDevelopment = (process.env.NODE_ENV || "development") === "development";

  if (err instanceof AppError) {
    logger.warn(`Operational Client Error: ${err.statusCode} - ${err.message}`);
    return res.status(err.statusCode).json({
      status: "error",
      statusCode: err.statusCode,
      message: err.message,
      ...(isDevelopment && { stack: err.stack })
    });
  }

  // Handle Multer upload limits specifically
  if (err.name === "MulterError") {
    logger.warn(`Upload Error: ${err.message}`);
    return res.status(400).json({
      status: "error",
      statusCode: 400,
      message: `File upload error: ${err.message}`
    });
  }

  // Unexpected catastrophic system error
  logger.error(`Catastrophic Server Error: ${err.message}`);
  logger.error(err.stack || "No stack trace available");

  return res.status(500).json({
    status: "error",
    statusCode: 500,
    message: isDevelopment ? err.message : "Internal Server Error. Please contact support.",
    ...(isDevelopment && { stack: err.stack })
  });
}
