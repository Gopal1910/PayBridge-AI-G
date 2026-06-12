import { Router } from "express";
import { AnalyticsService } from "../services/analyticsService.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// Secure the analytics path with JWT verification
router.use(verifyToken);

/**
 * GET /analytics
 * Retrieve real-time dashboard analytics compile for the user's company.
 */
router.get("/", async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const analytics = await AnalyticsService.getCompanyAnalytics(companyId);
    
    res.status(200).json({
      status: "success",
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

export default router;
