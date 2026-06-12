import { db } from "../firebase/firebase-admin.js";
import { NotFoundError } from "../utils/errors.js";
import logger from "../utils/logger.js";

export interface Invoice {
  id: string;
  buyerId: string;
  buyerName?: string;
  companyId: string;
  amount: number;
  status: "pending" | "paid" | "overdue" | "dispute" | "negotiating";
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
}

export class InvoiceService {
  
  /**
   * Create a new invoice record.
   */
  public static async create(companyId: string, data: {
    buyerId: string;
    buyerName?: string;
    amount: number;
    dueDate: string;
    status?: Invoice["status"];
  }): Promise<Invoice> {
    logger.info(`InvoiceService: Creating invoice of $${data.amount} for company ${companyId}`);
    
    const invoiceId = Math.random().toString(36).substring(2, 15);
    const invoice: Invoice = {
      id: invoiceId,
      buyerId: data.buyerId,
      buyerName: data.buyerName || "Unknown Buyer",
      companyId,
      amount: data.amount,
      status: data.status || "pending",
      dueDate: data.dueDate,
      createdAt: new Date().toISOString()
    };

    await db.collection("invoices").doc(invoiceId).set(invoice);
    return invoice;
  }

  /**
   * List invoices for a specific company.
   */
  public static async list(companyId: string): Promise<Invoice[]> {
    logger.info(`InvoiceService: Fetching invoices for company ${companyId}`);
    const snapshot = await db.collection("invoices").where("companyId", "==", companyId).get();
    const invoices: Invoice[] = [];
    
    snapshot.forEach((doc: any) => {
      invoices.push(doc.data() as Invoice);
    });

    return invoices;
  }

  /**
   * Retrieve a single invoice.
   */
  public static async get(companyId: string, id: string): Promise<Invoice> {
    logger.info(`InvoiceService: Getting invoice ${id} for company ${companyId}`);
    const doc = await db.collection("invoices").doc(id).get();
    if (!doc.exists) {
      throw new NotFoundError("Invoice not found.");
    }
    const invoice = doc.data() as Invoice;
    if (invoice.companyId !== companyId) {
      throw new NotFoundError("Invoice does not belong to this company.");
    }
    return invoice;
  }

  /**
   * Update fields of an invoice.
   */
  public static async update(companyId: string, id: string, data: Partial<Omit<Invoice, "id" | "companyId" | "createdAt">>): Promise<Invoice> {
    logger.info(`InvoiceService: Updating invoice ${id} for company ${companyId}`);
    
    const invoiceRef = db.collection("invoices").doc(id);
    const doc = await invoiceRef.get();
    if (!doc.exists) {
      throw new NotFoundError("Invoice not found.");
    }
    
    const existing = doc.data() as Invoice;
    if (existing.companyId !== companyId) {
      throw new NotFoundError("Invoice does not belong to this company.");
    }

    const updated = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    await invoiceRef.update(updated);
    return { ...existing, ...updated };
  }

  /**
   * Delete an invoice.
   */
  public static async delete(companyId: string, id: string): Promise<void> {
    logger.info(`InvoiceService: Deleting invoice ${id} for company ${companyId}`);
    const invoiceRef = db.collection("invoices").doc(id);
    const doc = await invoiceRef.get();
    if (!doc.exists) {
      throw new NotFoundError("Invoice not found.");
    }
    const existing = doc.data() as Invoice;
    if (existing.companyId !== companyId) {
      throw new NotFoundError("Invoice does not belong to this company.");
    }
    await invoiceRef.delete();
  }
}
