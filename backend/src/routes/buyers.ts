import { Router } from "express";
import { BuyerService } from "../services/buyerService.js";
import { verifyToken } from "../middlewares/auth.js";
import { validateSchema } from "../middlewares/validation.js";
import { createBuyerSchema } from "../utils/validationSchemas.js";

const router = Router();

// Secure all buyer paths with JWT verification
router.use(verifyToken);

/**
 * GET /buyers
 * Retrieve list of all registered buyers.
 */
router.get("/", async (req, res, next) => {
  try {
    const buyers = await BuyerService.list();
    res.status(200).json({
      status: "success",
      count: buyers.length,
      data: buyers
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /buyers
 * Create a new buyer credit profile manually.
 */
router.post("/", validateSchema(createBuyerSchema), async (req, res, next) => {
  try {
    const buyer = await BuyerService.create(req.body);
    res.status(201).json({
      status: "success",
      data: buyer
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /buyers/:id
 * Retrieve a specific buyer's payment score and audit log history.
 */
router.get("/:id", async (req, res, next) => {
  try {
    const buyer = await BuyerService.get(req.params.id);
    res.status(200).json({
      status: "success",
      data: buyer
    });
  } catch (error) {
    next(error);
  }
});

export default router;
