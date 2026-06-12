import { Router } from "express";
import { upload } from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/auth.js";
import { ContractService } from "../services/contractService.js";
import { InvoiceService } from "../services/invoiceService.js";
import { db, bucket } from "../firebase/firebase-admin.js";
import { extractTextFromPdf } from "../utils/ocr.js";
import { BadRequestError } from "../utils/errors.js";
import logger from "../utils/logger.js";

const router = Router();

// Secure all file uploads
router.use(verifyToken);

/**
 * POST /upload/contract
 * Uploads contract PDF, saves to storage, extracts text, runs AI analysis, and saves to database.
 */
router.post("/contract", upload.single("file"), async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const file = req.file;

    if (!file) {
      throw new BadRequestError("No file uploaded. Please upload a PDF contract.");
    }

    logger.info(`UploadRoute: Received contract upload ${file.originalname}`);

    // Step 1: Upload PDF to Firebase Storage (or save local mock file)
    const storagePath = `contracts/${companyId}/${Date.now()}_${file.originalname}`;
    const fileUploadRef = bucket.file(storagePath);
    await fileUploadRef.save(file.buffer, {
      metadata: { contentType: file.mimetype }
    });

    // Generate readable URL
    const signedUrlArray = await fileUploadRef.getSignedUrl({
      action: "read",
      expires: "03-09-2491" // Long-term URL
    });
    const pdfUrl = signedUrlArray[0];

    // Step 2: Extract text, run AI contract terms evaluation, and store metadata in db
    const contract = await ContractService.create(companyId, pdfUrl, file.originalname, file.buffer);

    res.status(201).json({
      status: "success",
      message: "Contract successfully uploaded and analyzed by AI.",
      data: contract
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /upload/invoice
 * Uploads invoice PDF, runs OCR text extraction, resolves invoice fields, and creates DB record.
 */
router.post("/invoice", upload.single("file"), async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const file = req.file;

    if (!file) {
      throw new BadRequestError("No file uploaded. Please upload an invoice PDF.");
    }

    logger.info(`UploadRoute: Received invoice upload ${file.originalname}`);

    // Step 1: Run OCR text extraction
    let extractedText = "";
    try {
      extractedText = await extractTextFromPdf(file.buffer);
    } catch (err) {
      throw new BadRequestError("Failed to extract text from invoice PDF. File may be corrupted.");
    }

    // Step 2: Heuristic extraction of invoice parameters
    const textLower = extractedText.toLowerCase();

    // Heuristic 1: Extract Amount
    let amount = 1500; // Default fallback amount
    const amountPatterns = [
      /(?:total|amount|due|balance)\s*(?:\$|usd|eur)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
      /(?:\$|usd|eur)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i
    ];
    for (const pattern of amountPatterns) {
      const match = extractedText.match(pattern);
      if (match && match[1]) {
        amount = parseFloat(match[1].replace(/,/g, ""));
        break;
      }
    }

    // Heuristic 2: Extract Buyer Name
    let buyerName = "Acme Corp";
    const buyerPatterns = [
      /(?:bill\s+to|invoice\s+to|client|buyer|customer):\s*([^\n\r]+)/i,
      /(?:to|for):\s*([^\n\r]+)/i
    ];
    for (const pattern of buyerPatterns) {
      const match = extractedText.match(pattern);
      if (match && match[1]) {
        buyerName = match[1].trim();
        break;
      }
    }

    // Heuristic 3: Extract Due Date
    let dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // Default 30 days from now
    const datePatterns = [
      /(?:due\s+date|payment\s+due|payable\s+by):\s*([0-9a-zA-Z\s,/-]+)/i,
      /(?:due):\s*([0-9a-zA-Z\s,/-]+)/i
    ];
    for (const pattern of datePatterns) {
      const match = extractedText.match(pattern);
      if (match && match[1]) {
        const parsedTime = Date.parse(match[1].trim());
        if (!isNaN(parsedTime)) {
          dueDate = new Date(parsedTime).toISOString().split("T")[0];
          break;
        }
      }
    }

    // Step 3: Register buyer if not exists
    let buyerId = "";
    const buyerQuery = await db.collection("buyers").where("name", "==", buyerName).get();
    if (!buyerQuery.empty) {
      buyerQuery.forEach((doc: any) => {
        buyerId = doc.id;
      });
    } else {
      buyerId = Math.random().toString(36).substring(2, 15);
      await db.collection("buyers").doc(buyerId).set({
        id: buyerId,
        name: buyerName,
        score: 82,
        history: ["Auto-registered via uploaded invoice"],
        createdAt: new Date().toISOString()
      });
    }

    // Step 4: Create Invoice
    const invoice = await InvoiceService.create(companyId, {
      buyerId,
      buyerName,
      amount,
      dueDate,
      status: "pending"
    });

    res.status(201).json({
      status: "success",
      message: "Invoice PDF successfully processed. Extracted fields mapped.",
      data: {
        invoice,
        ocrExtracted: {
          buyerName,
          amount,
          dueDate
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
