import { z } from "zod";

// User Register schema
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    passwordHash: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(2, "Name must be at least 2 characters long"),
    role: z.enum(["Admin", "Company", "Employee"], {
      errorMap: () => ({ message: "Role must be Admin, Company, or Employee" })
    }),
    companyName: z.string().optional(),
    industry: z.string().optional()
  })
});

// User Login schema
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
  })
});

// Invoice Create schema
export const createInvoiceSchema = z.object({
  body: z.object({
    buyerId: z.string().min(1, "Buyer ID is required"),
    buyerName: z.string().optional(),
    amount: z.number().positive("Amount must be greater than zero"),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Due date must be a valid date string"
    }),
    status: z.enum(["pending", "paid", "overdue", "dispute", "negotiating"]).optional()
  })
});

// Invoice Update schema
export const updateInvoiceSchema = z.object({
  body: z.object({
    buyerId: z.string().optional(),
    buyerName: z.string().optional(),
    amount: z.number().positive("Amount must be greater than zero").optional(),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Due date must be a valid date string"
    }).optional(),
    status: z.enum(["pending", "paid", "overdue", "dispute", "negotiating"]).optional()
  })
});

// Buyer Create schema
export const createBuyerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Buyer name must be at least 2 characters long"),
    score: z.number().min(0).max(100).optional(),
    history: z.array(z.string()).optional()
  })
});

// AI Analyze Contract schema
export const aiAnalyzeSchema = z.object({
  body: z.object({
    contractText: z.string().min(10, "Contract text is too short to analyze")
  })
});

// AI Insights Generate schema
export const aiInsightsSchema = z.object({
  body: z.object({
    companyId: z.string().min(1, "Company ID is required"),
    totalInvoiced: z.number().nonnegative(),
    averageDso: z.number().nonnegative(),
    overdueCount: z.number().nonnegative()
  })
});
