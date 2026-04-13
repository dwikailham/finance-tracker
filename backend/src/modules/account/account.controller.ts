import { Request, Response, NextFunction } from "express";
import { accountService } from "./account.service.js";
import { sendSuccess, sendError } from "../../utils/apiResponse.js";

export class AccountController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const accounts = await accountService.getAll(userId);
      sendSuccess({ res, message: "Daftar rekening berhasil diambil", data: accounts });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const account = await accountService.getById(userId, req.params.id as string);
      sendSuccess({ res, message: "Detail rekening berhasil diambil", data: account });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const account = await accountService.create(userId, req.body);
      sendSuccess({ res, statusCode: 201, message: "Rekening berhasil ditambahkan", data: account });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const account = await accountService.update(userId, req.params.id as string, req.body);
      sendSuccess({ res, message: "Rekening berhasil diperbarui", data: account });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      await accountService.archive(userId, req.params.id as string);
      sendSuccess({ res, message: "Rekening berhasil diarsipkan" });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }
}

export const accountController = new AccountController();
