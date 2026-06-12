import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

// Configure Helmet for secure HTTP headers
export const securityHeaders = helmet();

// Configure CORS for local development and cloud clients
export const corsOptions = cors({
  origin: "*", // Adjust in production to match your Vercel URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
});

// Generic Rate Limiting: 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict Rate Limiting for auth endpoints: 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 15,
  message: {
    status: 429,
    message: "Too many authentication attempts, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
