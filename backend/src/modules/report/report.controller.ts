import { Request, Response, NextFunction } from "express";
import { reportService } from "./report.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { z } from "zod";

export const getMonthYearSchema = z.object({
  query: z.object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2020).max(2100),
  })
});

export const getTrendSchema = z.object({
  query: z.object({
    months: z.coerce.number().int().min(1).max(24).optional().default(6),
  })
});

class ReportController {
  async getDashboardSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const summary = await reportService.getDashboardSummary(userId);
      sendSuccess({ res, message: "Ringkasan dashboard berhasil diambil", data: summary });
    } catch (error: any) {
      next(error);
    }
  }

  async getMonthlyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const month = Number(req.query.month);
      const year = Number(req.query.year);
      const report = await reportService.getMonthlyReport(userId, month, year);
      sendSuccess({ res, message: "Laporan bulanan berhasil diambil", data: report });
    } catch (error: any) {
      next(error);
    }
  }

  async getTrend(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const months = Number(req.query.months || 6);
      const data = await reportService.getTrend(userId, months);
      sendSuccess({ res, message: "Tren keuangan berhasil diambil", data });
    } catch (error: any) {
      next(error);
    }
  }

  async getCategoryBreakdown(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const month = Number(req.query.month);
      const year = Number(req.query.year);
      const data = await reportService.getCategoryBreakdown(userId, month, year);
      sendSuccess({ res, message: "Komposisi kategori berhasil diambil", data });
    } catch (error: any) {
      next(error);
    }
  }

  async getBudgetVsActual(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const month = Number(req.query.month);
      const year = Number(req.query.year);
      const data = await reportService.getBudgetVsActual(userId, month, year);
      sendSuccess({ res, message: "Budget vs Aktualisasi berhasil diambil", data });
    } catch (error: any) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
