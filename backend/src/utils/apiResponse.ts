import { Response } from "express";

interface ApiResponseOptions {
  res: Response;
  statusCode?: number;
  message: string;
  data?: unknown;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function sendSuccess({
  res,
  statusCode = 200,
  message,
  data,
  meta,
}: ApiResponseOptions) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    meta: meta ?? undefined,
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors ?? undefined,
  });
}
