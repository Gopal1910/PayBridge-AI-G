import { Router } from "express";
import { ContractService } from "../services/contractService.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// Secure all contract paths with JWT verification
router.use(verifyToken);

/**
 * GET /contracts
 * Retrieve all contracts scoped to user's company ID.
 */
router.get("/", async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const contracts = await ContractService.list(companyId);
    
    res.status(200).json({
      status: "success",
      count: contracts.length,
      data: contracts
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /contracts/:id
 * Retrieve detail and AI analysis for a specific contract.
 */
router.get("/:id", async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const contract = await ContractService.get(companyId, req.params.id);
    
    res.status(200).json({
      status: "success",
      data: contract
    });
  } catch (error) {
    next(error);
  }
});

export default router;
