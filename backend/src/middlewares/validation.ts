import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { BadRequestError } from "../utils/errors.js";

/**
 * Standard Zod Schema Validation Middleware.
 * Validates req.body, req.query, and req.params schemas.
 */
export const validateSchema = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Re-assign parsed inputs for type safety
      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;
      
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(" | ");
        return next(new BadRequestError(`Validation Failed: ${errorMessages}`));
      }
      return next(error);
    }
  };
};
