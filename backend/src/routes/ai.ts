import { Router } from "express";
import { AIService } from "../ai/aiService.js";
import { verifyToken } from "../middlewares/auth.js";
import { validateSchema } from "../middlewares/validation.js";
import { aiAnalyzeSchema, aiInsightsSchema } from "../utils/validationSchemas.js";

const router = Router();

// Secure AI routes
router.use(verifyToken);

/**
 * POST /ai/analyze
 * Directly analyze contract text.
 */
router.post("/analyze", validateSchema(aiAnalyzeSchema), async (req, res, next) => {
  try {
    const { contractText } = req.body;
    const analysis = await AIService.analyzeContract(contractText);
    
    res.status(200).json({
      status: "success",
      data: analysis
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /ai/insights
 * Calculate general company forecasting insights.
 */
router.post("/insights", validateSchema(aiInsightsSchema), async (req, res, next) => {
  try {
    const { companyId, totalInvoiced, averageDso, overdueCount } = req.body;
    const insights = await AIService.generateInsights(companyId, {
      totalInvoiced,
      averageDso,
      overdueCount
    });

    res.status(200).json({
      status: "success",
      data: insights
    });
  } catch (error) {
    next(error);
  }
});

export default router;
