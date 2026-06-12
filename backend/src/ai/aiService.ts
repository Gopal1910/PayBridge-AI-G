import logger from "../utils/logger.js";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

/**
 * Interface with the local Ollama instance running Llama 3.
 * Includes high-fidelity rule-based fallback if Ollama is not reachable.
 */
export class AIService {
  
  /**
   * Post a prompt to local Ollama server and expect JSON back.
   */
  private static async queryOllama(prompt: string, systemPrompt?: string): Promise<any> {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: `${systemPrompt ? `System: ${systemPrompt}\n\n` : ""}User: ${prompt}\n\nReturn JSON output ONLY.`,
          format: "json",
          stream: false,
          options: {
            temperature: 0.1
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }

      const result = await response.json();
      return JSON.parse(result.response);
    } catch (error) {
      logger.warn(`Ollama query failed (using local fallback service): ${error instanceof Error ? error.message : String(error)}`);
      throw error; // Let the caller catch and trigger fallback
    }
  }

  /**
   * Extracts contract parameters and reviews payment clauses.
   */
  public static async analyzeContract(contractText: string): Promise<{
    buyerName: string;
    terms: string;
    amount: number;
    risk: "low" | "medium" | "high";
    recommended: string;
    clauses: Array<{ title: string; text: string; risk: string; impact: string }>;
    summary: string;
  }> {
    try {
      const systemPrompt = "You are a legal contract analyzer specialized in B2B payment terms and SME cashflow risk. Output JSON ONLY matching the requested keys.";
      const prompt = `Analyze this contract text. Extract buyerName, terms, amount (numeric value), risk assessment (low, medium, high), recommended payment terms (e.g. Net-30), key payment clauses (with keys: title, text, risk, impact), and a brief overall summary. Here is the contract text: ${contractText}`;
      
      return await this.queryOllama(prompt, systemPrompt);
    } catch (fallback) {
      logger.info("Executing rule-based heuristic fallback for contract analysis");
      
      // Heuristic parsing
      const text = contractText.toLowerCase();
      
      // Find term
      let terms = "Net-30";
      let risk: "low" | "medium" | "high" = "low";
      let recommended = "Net-30";
      
      if (text.includes("90 days") || text.includes("net 90") || text.includes("net-90")) {
        terms = "Net-90";
        risk = "high";
        recommended = "Net-45";
      } else if (text.includes("60 days") || text.includes("net 60") || text.includes("net-60")) {
        terms = "Net-60";
        risk = "medium";
        recommended = "Net-30";
      } else if (text.includes("45 days") || text.includes("net 45") || text.includes("net-45")) {
        terms = "Net-45";
        risk = "medium";
        recommended = "Net-30";
      } else if (text.includes("30 days") || text.includes("net 30") || text.includes("net-30")) {
        terms = "Net-30";
        risk = "low";
        recommended = "Net-30";
      } else if (text.includes("15 days") || text.includes("net 15") || text.includes("net-15")) {
        terms = "Net-15";
        risk = "low";
        recommended = "Net-15";
      }

      // Find buyer
      let buyerName = "Unknown Buyer";
      const buyerMatch = contractText.match(/(?:between|buyer|client|purchaser)\s+([^,\n\.]+)(?:,|\s+and)/i);
      if (buyerMatch && buyerMatch[1]) {
        buyerName = buyerMatch[1].trim();
      }

      // Find amount
      let amount = 0;
      const amountMatch = contractText.match(/(?:\$|usd|amount\s+of)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
      if (amountMatch && amountMatch[1]) {
        amount = parseFloat(amountMatch[1].replace(/,/g, ""));
      }

      const clauses = [
        {
          title: "Payment Terms Clause",
          text: contractText.substring(0, Math.min(200, contractText.length)),
          risk: risk,
          impact: risk === "high" 
            ? "Net-90 terms restrict cash flow, requiring company to finance operations for 3 months." 
            : risk === "medium" 
            ? "Net-60 / Net-45 terms increase the DSO (Days Sales Outstanding) slightly beyond ideal boundaries." 
            : "Net-30 terms are healthy and align with standard operational cash cycle requirements."
        }
      ];

      return {
        buyerName,
        terms,
        amount,
        risk,
        recommended,
        clauses,
        summary: `The contract outlines payment terms under ${terms} of $${amount.toLocaleString()} for ${buyerName}. Classified as ${risk} risk.`
      };
    }
  }

  /**
   * Assesses buyer repayment risk based on historical parameters.
   */
  public static async calculateRisk(
    buyerName: string,
    invoiceAmount: number,
    paymentTerms: string,
    outstandingBalance = 0
  ): Promise<{
    score: number;
    riskLevel: "low" | "medium" | "high";
    factors: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `Calculate buyer credit risk. Buyer: "${buyerName}", Amount: $${invoiceAmount}, Terms: "${paymentTerms}", Outstanding Balance: $${outstandingBalance}. Return JSON with fields "score" (0-100 where 100 is lowest risk), "riskLevel" ("low" | "medium" | "high"), "factors" (array of strings), and "recommendations" (array of strings).`;
      return await this.queryOllama(prompt);
    } catch (fallback) {
      logger.info("Executing rule-based heuristic fallback for buyer risk calculation");

      let score = 85;
      const factors: string[] = [];
      const recommendations: string[] = [];

      // Check payment terms
      if (paymentTerms.toLowerCase().includes("90")) {
        score -= 20;
        factors.push("Payment term of 90 days is extremely long for SMEs.");
        recommendations.push("Negotiate terms down to Net-45 or Net-30.");
      } else if (paymentTerms.toLowerCase().includes("60")) {
        score -= 10;
        factors.push("Payment term of 60 days exceeds standard B2B cycle.");
        recommendations.push("Offer a 1.5% prompt-payment discount for Net-15 terms.");
      }

      // Check outstanding balance
      if (outstandingBalance > 50000) {
        score -= 15;
        factors.push(`Buyer has a high outstanding balance of $${outstandingBalance.toLocaleString()}.`);
        recommendations.push("Require partial prepayment before starting new deliveries.");
      }

      // Check large invoice size
      if (invoiceAmount > 100000) {
        score -= 10;
        factors.push("Single invoice concentration represents significant risk.");
        recommendations.push("Insure this trade credit transaction against default.");
      }

      let riskLevel: "low" | "medium" | "high" = "low";
      if (score < 60) {
        riskLevel = "high";
      } else if (score < 80) {
        riskLevel = "medium";
      }

      if (factors.length === 0) {
        factors.push("Buyer payment terms align with standard guidelines.");
        factors.push("Low total outstanding exposure for company.");
        recommendations.push("Proceed with default payment collection terms.");
      }

      return {
        score,
        riskLevel,
        factors,
        recommendations
      };
    }
  }

  /**
   * Suggests better term renegotiations.
   */
  public static async suggestTerms(
    invoiceAmount: number,
    currentTerms: string
  ): Promise<{
    originalTerms: string;
    suggestedTerms: string;
    earlyPaymentDiscount: string;
    workingCapitalImpact: number;
    rationale: string;
  }> {
    try {
      const prompt = `Suggest better terms for invoice of amount $${invoiceAmount} with original terms of "${currentTerms}". Return JSON with fields: originalTerms, suggestedTerms, earlyPaymentDiscount, workingCapitalImpact (numeric estimated increase in liquidity), and rationale.`;
      return await this.queryOllama(prompt);
    } catch (fallback) {
      logger.info("Executing rule-based fallback for suggesting payment terms");

      let suggestedTerms = "Net-30";
      let discount = "No discount recommended";
      let workingCapitalImpact = Math.round(invoiceAmount * 0.08);

      if (currentTerms.toLowerCase().includes("90")) {
        suggestedTerms = "Net-45";
        discount = "2% discount for Net-15 payment";
        workingCapitalImpact = Math.round(invoiceAmount * 0.15);
      } else if (currentTerms.toLowerCase().includes("60")) {
        suggestedTerms = "Net-30";
        discount = "1.5% discount for Net-10 payment";
        workingCapitalImpact = Math.round(invoiceAmount * 0.10);
      }

      return {
        originalTerms: currentTerms,
        suggestedTerms,
        earlyPaymentDiscount: discount,
        workingCapitalImpact,
        rationale: `Replacing ${currentTerms} with ${suggestedTerms} shortens the cash conversion cycle by reducing average days sales outstanding (DSO). This frees up capital to reinvest in stock and equipment.`
      };
    }
  }

  /**
   * Generates general company insights for dashboard forecast.
   */
  public static async generateInsights(
    companyId: string,
    metrics: { totalInvoiced: number; averageDso: number; overdueCount: number }
  ): Promise<{
    cashflowForecast: Array<{ month: string; inflow: number; outflow: number; forecast: number }>;
    riskScoreDistribution: { low: number; medium: number; high: number };
    topInsights: string[];
  }> {
    try {
      const prompt = `Generate dashboard cashflow and risk insights for a company with total invoices $${metrics.totalInvoiced}, average DSO of ${metrics.averageDso} days, and ${metrics.overdueCount} overdue invoices. Return JSON with cashflowForecast (array of 3 elements with month, inflow, outflow, forecast), riskScoreDistribution (keys: low, medium, high), and topInsights (array of 3 strings).`;
      return await this.queryOllama(prompt);
    } catch (fallback) {
      logger.info("Executing rule-based fallback for generating cashflow insights");

      // Set up current date forecast
      const months = ["June", "July", "August"];
      const inflowBase = Math.round(metrics.totalInvoiced * 0.4);
      const outflowBase = Math.round(inflowBase * 0.8);

      const cashflowForecast = months.map((m, idx) => {
        const inflow = Math.round(inflowBase * (1 + idx * 0.1));
        const outflow = Math.round(outflowBase * (1 + idx * 0.05));
        return {
          month: m,
          inflow,
          outflow,
          forecast: inflow - outflow
        };
      });

      const lowRiskCount = Math.max(1, Math.round(metrics.totalInvoiced / 15000) - metrics.overdueCount);
      const highRiskCount = metrics.overdueCount;
      const mediumRiskCount = Math.round(lowRiskCount * 0.3);

      const topInsights = [
        `Improving average DSO from ${metrics.averageDso} days to 30 days would unlock approximately $${Math.round(metrics.totalInvoiced * 0.05).toLocaleString()} in operating cash.`,
        `You have ${metrics.overdueCount} overdue invoice(s). Fast-tracking these accounts will boost your working capital reserve immediately.`,
        "Your highest credit exposure is concentrated in 2 major buyers. Consider adding credit insurance protection."
      ];

      return {
        cashflowForecast,
        riskScoreDistribution: {
          low: lowRiskCount,
          medium: mediumRiskCount,
          high: highRiskCount
        },
        topInsights
      };
    }
  }
}
