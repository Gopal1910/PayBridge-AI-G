import { Router } from "express";
import { AnalyticsService } from "../services/analyticsService.js";
import { InvoiceService } from "../services/invoiceService.js";
import { BuyerService } from "../services/buyerService.js";
import { NegotiationService } from "../services/negotiationService.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// Secure all dashboard helper routes with JWT verification
router.use(verifyToken);

/**
 * GET /dashboard/overview
 * Unified summary card metrics.
 */
router.get("/overview", async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const analytics = await AnalyticsService.getCompanyAnalytics(companyId);
    
    res.status(200).json({
      status: "success",
      data: {
        workingCapitalIndex: analytics.riskIndex,
        totalInvoiced: analytics.totalInvoiced,
        totalPaid: analytics.totalPaid,
        totalPending: analytics.totalPending,
        totalOverdue: analytics.totalOverdue,
        averageDso: analytics.averageDso,
        overdueCount: analytics.overdueCount
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /dashboard/invoices
 * Summary list of company invoices.
 */
router.get("/invoices", async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const invoices = await InvoiceService.list(companyId);
    res.status(200).json({
      status: "success",
      data: invoices
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /dashboard/buyers
 * Retrieve registered buyer profiles and credit ratings.
 */
router.get("/buyers", async (req: any, res, next) => {
  try {
    const buyers = await BuyerService.list();
    res.status(200).json({
      status: "success",
      data: buyers
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /dashboard/analytics
 * Retrieve detailed forecast timeline.
 */
router.get("/analytics", async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const analytics = await AnalyticsService.getCompanyAnalytics(companyId);
    res.status(200).json({
      status: "success",
      data: {
        cashflowForecast: analytics.cashflowForecast,
        topInsights: analytics.topInsights
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /dashboard/risk
 * Score ratings statistics.
 */
router.get("/risk", async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const analytics = await AnalyticsService.getCompanyAnalytics(companyId);
    res.status(200).json({
      status: "success",
      data: {
        riskIndex: analytics.riskIndex,
        riskScoreDistribution: analytics.riskScoreDistribution
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /dashboard/negotiation
 * Active renegotiation recommendations.
 */
router.get("/negotiation", async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const negotiations = await NegotiationService.list(companyId);
    res.status(200).json({
      status: "success",
      data: negotiations
    });
  } catch (error) {
    next(error);
  }
});

export default router;
