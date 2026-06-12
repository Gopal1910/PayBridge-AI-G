import pdf from "pdf-parse";
import logger from "./logger.js";

/**
 * Extracts plain text from a PDF buffer.
 * Falls back to an empty string if parsing fails.
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    logger.info("Starting PDF text extraction...");
    const parsedData = await pdf(pdfBuffer);
    const text = parsedData.text || "";
    logger.info(`Successfully extracted ${text.length} characters from PDF.`);
    return text;
  } catch (error) {
    logger.error(`Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
