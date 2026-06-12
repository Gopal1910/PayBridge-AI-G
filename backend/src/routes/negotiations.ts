import { Router } from "express";
import { NegotiationService } from "../services/negotiationService.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// Secure all negotiation paths with JWT verification
router.use(verifyToken);

/**
 * GET /negotiations
 * List all calculated terms optimization recommendations.
 */
router.get("/", async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const negotiations = await NegotiationService.list(companyId);
    
    res.status(200).json({
      status: "success",
      count: negotiations.length,
      data: negotiations
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /negotiations
 * Create a new payment terms negotiation optimization profile for an invoice.
 */
router.post("/", async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { invoiceId } = req.body;
    
    if (!invoiceId) {
      return res.status(400).json({ status: "error", message: "invoiceId is required." });
    }

    const negotiation = await NegotiationService.create(companyId, invoiceId);
    
    res.status(201).json({
      status: "success",
      data: negotiation
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /negotiations/:id
 * Retrieve detail of a single optimization recommend log.
 */
router.get("/:id", async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const negotiation = await NegotiationService.get(companyId, req.params.id);
    
    res.status(200).json({
      status: "success",
      data: negotiation
    });
  } catch (error) {
    next(error);
  }
});

export default router;
