import { Request, Response, NextFunction } from "express";
import { transactionService } from "./transaction.service.js";
import { sendSuccess, sendError } from "../../utils/apiResponse.js";

export class TransactionController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const result = await transactionService.getAll(userId, req.query as any);
      sendSuccess({ res, message: "Daftar transaksi berhasil diambil", data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const transaction = await transactionService.getById(userId, req.params.id);
      sendSuccess({ res, message: "Detail transaksi berhasil diambil", data: transaction });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const transaction = await transactionService.create(userId, req.body);
      sendSuccess({ res, statusCode: 201, message: "Transaksi berhasil ditambahkan", data: transaction });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const transaction = await transactionService.update(userId, req.params.id, req.body);
      sendSuccess({ res, message: "Transaksi berhasil diperbarui", data: transaction });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      await transactionService.delete(userId, req.params.id);
      sendSuccess({ res, message: "Transaksi berhasil dihapus" });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
