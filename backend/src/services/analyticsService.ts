import { db } from "../firebase/firebase-admin.js";
import { InvoiceService } from "./invoiceService.js";
import { AIService } from "../ai/aiService.js";
import logger from "../utils/logger.js";

export interface AnalyticsSnapshot {
  companyId: string;
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalNegotiating: number;
  averageDso: number;
  overdueCount: number;
  riskIndex: number; // 0-100 overall health
  cashflowForecast: Array<{ month: string; inflow: number; outflow: number; forecast: number }>;
  riskScoreDistribution: { low: number; medium: number; high: number };
  topInsights: string[];
  updatedAt: string;
}

export class AnalyticsService {
  
  /**
   * Generates a complete up-to-date analytics snapshot for a company.
   */
  public static async getCompanyAnalytics(companyId: string): Promise<AnalyticsSnapshot> {
    logger.info(`AnalyticsService: Compiling dashboard insights for company ${companyId}`);

    // Fetch invoices
    const invoices = await InvoiceService.list(companyId);

    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    let totalNegotiating = 0;
    let overdueCount = 0;
    
    let dsoSum = 0;
    let dsoCount = 0;

    invoices.forEach(inv => {
      totalInvoiced += inv.amount;
      if (inv.status === "paid") {
        totalPaid += inv.amount;
        
        // Compute DSO for paid invoices
        const paidTime = new Date(inv.updatedAt || inv.dueDate).getTime();
        const createdTime = new Date(inv.createdAt).getTime();
        const diffDays = Math.round((paidTime - createdTime) / (1000 * 60 * 60 * 24));
        dsoSum += Math.max(0, diffDays);
        dsoCount++;
      } else if (inv.status === "pending") {
        totalPending += inv.amount;
      } else if (inv.status === "overdue") {
        totalOverdue += inv.amount;
        overdueCount++;
      } else if (inv.status === "negotiating") {
        totalNegotiating += inv.amount;
      }

      // Check if overdue by date if status is not paid/overdue already
      if (inv.status !== "paid" && new Date(inv.dueDate).getTime() < Date.now()) {
        if (inv.status !== "overdue") {
          totalOverdue += inv.amount;
          overdueCount++;
        }
      }
    });

    const averageDso = dsoCount > 0 ? Math.round(dsoSum / dsoCount) : 34; // Default standard DSO if no history

    // Run local AI to compute monthly forecasts and text insights
    const aiOutput = await AIService.generateInsights(companyId, {
      totalInvoiced,
      averageDso,
      overdueCount
    });

    // Compute simple risk index (higher is safer)
    let riskIndex = 100;
    if (totalInvoiced > 0) {
      const overdueRatio = totalOverdue / totalInvoiced;
      riskIndex = Math.max(10, Math.round(100 - (overdueRatio * 80) - (averageDso > 45 ? 15 : 0)));
    }

    const snapshot: AnalyticsSnapshot = {
      companyId,
      totalInvoiced,
      totalPaid,
      totalPending,
      totalOverdue,
      totalNegotiating,
      averageDso,
      overdueCount,
      riskIndex,
      cashflowForecast: aiOutput.cashflowForecast,
      riskScoreDistribution: aiOutput.riskScoreDistribution,
      topInsights: aiOutput.topInsights,
      updatedAt: new Date().toISOString()
    };

    // Cache the snapshot in Firestore
    await db.collection("analytics").doc(companyId).set(snapshot);

    return snapshot;
  }
}
