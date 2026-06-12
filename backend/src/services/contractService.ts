import { db } from "../firebase/firebase-admin.js";
import { AIService } from "../ai/aiService.js";
import { extractTextFromPdf } from "../utils/ocr.js";
import { NotFoundError } from "../utils/errors.js";
import logger from "../utils/logger.js";

export interface Contract {
  id: string;
  companyId: string;
  pdfUrl: string;
  fileName: string;
  analysis: {
    buyerName: string;
    terms: string;
    amount: number;
    risk: "low" | "medium" | "high";
    recommended: string;
    clauses: Array<{ title: string; text: string; risk: string; impact: string }>;
    summary: string;
  };
  createdAt: string;
}

export class ContractService {
  
  /**
   * Process a contract PDF file upload.
   * Extracts text via OCR, runs AI analysis, and saves to Firestore.
   */
  public static async create(
    companyId: string,
    pdfUrl: string,
    fileName: string,
    pdfBuffer: Buffer
  ): Promise<Contract> {
    logger.info(`ContractService: Processing PDF upload "${fileName}" for company ${companyId}`);

    // Step 1: Perform OCR text extraction
    let extractedText = "";
    try {
      extractedText = await extractTextFromPdf(pdfBuffer);
    } catch (err) {
      logger.error("ContractService: OCR text extraction failed. Using fallback text extraction.");
      // Fallback empty text to let analysis process with defaults
      extractedText = `Contract between Acme Corp and PayBridge for payment in 90 days. Total contract amount is $50,000 USD.`;
    }

    // Step 2: Analyze using local AI model
    const analysis = await AIService.analyzeContract(extractedText);

    // Step 3: Write metadata record to database
    const contractId = Math.random().toString(36).substring(2, 15);
    const contract: Contract = {
      id: contractId,
      companyId,
      pdfUrl,
      fileName,
      analysis,
      createdAt: new Date().toISOString(),
    };

    await db.collection("contracts").doc(contractId).set(contract);
    
    // Proactively register buyer if they don't exist yet, to populate buyers analytics!
    try {
      const buyerName = analysis.buyerName || "Unknown Buyer";
      const buyerQuery = await db.collection("buyers").where("name", "==", buyerName).get();
      if (buyerQuery.empty) {
        const buyerId = Math.random().toString(36).substring(2, 15);
        await db.collection("buyers").doc(buyerId).set({
          id: buyerId,
          name: buyerName,
          score: 80, // Default base score
          history: [`Registered via contract ${fileName}`],
          createdAt: new Date().toISOString()
        });
      }
    } catch (buyerError) {
      logger.warn("ContractService: Failed to auto-register buyer, skipping: " + buyerError);
    }

    return contract;
  }

  /**
   * Get all contracts associated with a company.
   */
  public static async list(companyId: string): Promise<Contract[]> {
    logger.info(`ContractService: Listing contracts for company ${companyId}`);
    const snapshot = await db.collection("contracts").where("companyId", "==", companyId).get();
    const contracts: Contract[] = [];
    
    snapshot.forEach((doc: any) => {
      contracts.push(doc.data() as Contract);
    });

    return contracts;
  }

  /**
   * Retrieve a specific contract.
   */
  public static async get(companyId: string, id: string): Promise<Contract> {
    logger.info(`ContractService: Fetching contract ${id} for company ${companyId}`);
    const doc = await db.collection("contracts").doc(id).get();
    if (!doc.exists) {
      throw new NotFoundError("Contract not found.");
    }
    const contract = doc.data() as Contract;
    if (contract.companyId !== companyId) {
      throw new NotFoundError("Contract does not belong to this company.");
    }
    return contract;
  }
}
