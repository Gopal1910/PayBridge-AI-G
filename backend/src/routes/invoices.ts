import { Router } from "express";
import { InvoiceService } from "../services/invoiceService.js";
import { verifyToken } from "../middlewares/auth.js";
import { validateSchema } from "../middlewares/validation.js";
import { createInvoiceSchema, updateInvoiceSchema } from "../utils/validationSchemas.js";

const router = Router();

// Secure all invoice paths with JWT verification
router.use(verifyToken);

/**
 * GET /invoices
 * Retrieve all invoices scoped to user's company ID.
 */
router.get("/", async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const invoices = await InvoiceService.list(companyId);
    
    res.status(200).json({
      status: "success",
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /invoices
 * Create a new invoice record.
 */
router.post("/", validateSchema(createInvoiceSchema), async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const invoice = await InvoiceService.create(companyId, req.body);
    
    res.status(201).json({
      status: "success",
      data: invoice
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /invoices/:id
 * Retrieve detail for a specific invoice.
 */
router.get("/:id", async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const invoice = await InvoiceService.get(companyId, req.params.id);
    
    res.status(200).json({
      status: "success",
      data: invoice
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /invoices/:id
 * Update an existing invoice record.
 */
router.put("/:id", validateSchema(updateInvoiceSchema), async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    const invoice = await InvoiceService.update(companyId, req.params.id, req.body);
    
    res.status(200).json({
      status: "success",
      data: invoice
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /invoices/:id
 * Delete an invoice.
 */
router.delete("/:id", async (req: any, res, next) => {
  try {
    const companyId = req.user.companyId;
    await InvoiceService.delete(companyId, req.params.id);
    
    res.status(200).json({
      status: "success",
      message: "Invoice successfully deleted."
    });
  } catch (error) {
    next(error);
  }
});

export default router;
