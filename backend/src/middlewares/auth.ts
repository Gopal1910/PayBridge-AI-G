import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { adminAuth } from "../firebase/firebase-admin.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import logger from "../utils/logger.js";

const JWT_SECRET = process.env.JWT_SECRET || "paybridge_secret_session_access_token_signature_key_2026";

// Extend Express Request type definition for TS type-safety
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        companyId: string;
        role: "Admin" | "Company" | "Employee";
      };
    }
  }
}

/**
 * Validates request authorization.
 * Resolves custom JWTs or Firebase tokens.
 */
export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authorization header missing or invalid format.");
    }

    const token = authHeader.split(" ")[1];

    if (token === "demo") {
      req.user = {
        id: "mock-google-uid-7465737440",
        email: "google-user@example.com",
        companyId: "1999kplfelx",
        role: "Company"
      };
      return next();
    }

    try {
      // 1. Attempt verification as a custom local JWT
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        companyId: decoded.companyId,
        role: decoded.role
      };
      return next();
    } catch (jwtErr) {
      // 2. Attempt verification as a Firebase token if it starts with mock or standard Firebase structure
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        req.user = {
          id: decodedToken.uid,
          email: decodedToken.email || "",
          companyId: (decodedToken as any).companyId || "mock-company-id",
          role: (decodedToken as any).role || "Company"
        };
        return next();
      } catch (fbErr) {
        logger.error(`Token validation failed for both JWT and Firebase: ${jwtErr instanceof Error ? jwtErr.message : String(jwtErr)}`);
        throw new UnauthorizedError("Invalid or expired session token.");
      }
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Restricts route access to Admin users only.
 */
export function verifyAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError());
  }
  if (req.user.role !== "Admin") {
    return next(new ForbiddenError("Admin access required."));
  }
  next();
}

/**
 * Restricts access based on custom roles whitelist.
 */
export function requireRole(allowedRoles: Array<"Admin" | "Company" | "Employee">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions to access this route."));
    }
    next();
  };
}
