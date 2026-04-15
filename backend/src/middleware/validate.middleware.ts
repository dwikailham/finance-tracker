import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { sendError } from "../utils/apiResponse.js";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return sendError(res, 400, "Validation error", result.error.flatten());
    }

    const data = result.data as any;

    // Overwrite dengan data yang sudah di-parse & transform
    if (data.body) req.body = data.body;
    if (data.query) Object.assign(req.query, data.query);
    if (data.params) Object.assign(req.params, data.params);

    next();
  };
}
