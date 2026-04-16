import { Request, Response, NextFunction } from "express";
import { budgetService } from "./budget.service.js";
import { sendSuccess, sendError } from "../../utils/apiResponse.js";

export class BudgetController {
  async getByMonth(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const budgets = await budgetService.getByMonth(userId, req.query as any);
      sendSuccess({ res, message: "Daftar budget berhasil diambil", data: budgets });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const summary = await budgetService.getSummary(userId, req.query as any);
      sendSuccess({ res, message: "Ringkasan budget berhasil diambil", data: summary });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const budget = await budgetService.create(userId, req.body);
      sendSuccess({ res, statusCode: 201, message: "Budget berhasil ditambahkan", data: budget });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const budget = await budgetService.update(userId, req.params.id as string, req.body);
      sendSuccess({ res, message: "Budget berhasil diperbarui", data: budget });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      await budgetService.delete(userId, req.params.id as string);
      sendSuccess({ res, message: "Budget berhasil dihapus" });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async copy(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const result = await budgetService.copyFromMonth(userId, req.body);
      sendSuccess({
        res,
        statusCode: 201,
        message: `${result.count} budget berhasil di-copy`,
        data: result,
      });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }
}

export const budgetController = new BudgetController();
