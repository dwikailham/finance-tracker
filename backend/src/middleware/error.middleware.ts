import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  if (err.name === "ZodError") {
    return sendError(res, 400, "Validation error", err);
  }

  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Token expired");
  }

  return sendError(res, 500, "Internal server error");
}
