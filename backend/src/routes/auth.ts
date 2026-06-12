import { Router } from "express";
import { AuthService } from "../services/authService.js";
import { verifyToken } from "../middlewares/auth.js";
import { validateSchema } from "../middlewares/validation.js";
import { registerSchema, loginSchema } from "../utils/validationSchemas.js";
import { authLimiter } from "../middlewares/security.js";
import logger from "../utils/logger.js";

const router = Router();

/**
 * POST /auth/register
 * Register a user and associate them with a company.
 */
router.post(
  "/register",
  authLimiter,
  validateSchema(registerSchema),
  async (req, res, next) => {
    try {
      const { email, passwordHash, name, role, companyName, industry } = req.body;
      const result = await AuthService.register({
        email,
        passwordHash,
        name,
        role,
        companyName,
        industry
      });
      
      res.status(201).json({
        status: "success",
        message: "User successfully registered.",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /auth/login
 * Authenticate credentials and return Access & Refresh tokens.
 */
router.post(
  "/login",
  authLimiter,
  validateSchema(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.status(200).json({
        status: "success",
        message: "Login successful.",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /auth/google
 * Authenticate using Google/Firebase ID Token.
 */
router.post("/google", authLimiter, async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ status: "error", message: "Google idToken is required." });
    }
    const result = await AuthService.loginWithGoogle(idToken);
    res.status(200).json({
      status: "success",
      message: "Google sign-in successful.",
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/logout
 * Terminate session.
 */
router.post("/logout", (req, res) => {
  logger.info("User logged out");
  res.status(200).json({
    status: "success",
    message: "Logout successful. Session cleared."
  });
});

/**
 * POST /auth/refresh
 * Refresh session access token.
 */
router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ status: "error", message: "Refresh token is required." });
    }
    const result = await AuthService.refresh(refreshToken);
    res.status(200).json({
      status: "success",
      message: "Tokens successfully refreshed.",
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/profile
 * Get authenticated user profile.
 */
router.get("/profile", verifyToken, async (req: any, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await AuthService.getProfile(userId);
    res.status(200).json({
      status: "success",
      data: { user: profile }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
