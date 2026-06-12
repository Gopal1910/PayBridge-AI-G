import { db } from "../firebase/firebase-admin.js";
import { InvoiceService } from "./invoiceService.js";
import { AIService } from "../ai/aiService.js";
import { NotFoundError } from "../utils/errors.js";
import logger from "../utils/logger.js";

export interface Negotiation {
  id: string;
  invoiceId: string;
  companyId: string;
  buyerName: string;
  amount: number;
  originalTerms: string;
  recommendation: {
    originalTerms: string;
    suggestedTerms: string;
    earlyPaymentDiscount: string;
    workingCapitalImpact: number;
    rationale: string;
  };
  createdAt: string;
}

export class NegotiationService {
  
  /**
   * Run payment terms optimization for an invoice and save result.
   */
  public static async create(companyId: string, invoiceId: string): Promise<Negotiation> {
    logger.info(`NegotiationService: Analyzing terms for invoice ${invoiceId}`);

    // Retrieve Invoice
    const invoice = await InvoiceService.get(companyId, invoiceId);

    // Calculate original terms text (e.g. days from today to due date)
    const dueTime = new Date(invoice.dueDate).getTime();
    const createTime = new Date(invoice.createdAt).getTime();
    const diffDays = Math.max(1, Math.round((dueTime - createTime) / (1000 * 60 * 60 * 24)));
    const originalTerms = `Net-${diffDays}`;

    // Get suggestion from local AI engine
    const recommendation = await AIService.suggestTerms(invoice.amount, originalTerms);

    const negotiationId = Math.random().toString(36).substring(2, 15);
    const negotiation: Negotiation = {
      id: negotiationId,
      invoiceId,
      companyId,
      buyerName: invoice.buyerName || "Unknown Buyer",
      amount: invoice.amount,
      originalTerms,
      recommendation,
      createdAt: new Date().toISOString()
    };

    await db.collection("negotiations").doc(negotiationId).set(negotiation);
    return negotiation;
  }

  /**
   * List negotiations for a company.
   */
  public static async list(companyId: string): Promise<Negotiation[]> {
    logger.info(`NegotiationService: Retrieving all negotiations for company ${companyId}`);
    const snapshot = await db.collection("negotiations").where("companyId", "==", companyId).get();
    const negotiations: Negotiation[] = [];
    
    snapshot.forEach((doc: any) => {
      negotiations.push(doc.data() as Negotiation);
    });

    return negotiations;
  }

  /**
   * Fetch a single negotiation suggestion.
   */
  public static async get(companyId: string, id: string): Promise<Negotiation> {
    logger.info(`NegotiationService: Fetching negotiation ${id} for company ${companyId}`);
    const doc = await db.collection("negotiations").doc(id).get();
    if (!doc.exists) {
      throw new NotFoundError("Negotiation analysis not found.");
    }
    const negotiation = doc.data() as Negotiation;
    if (negotiation.companyId !== companyId) {
      throw new NotFoundError("Negotiation does not belong to this company.");
    }
    return negotiation;
  }
}
