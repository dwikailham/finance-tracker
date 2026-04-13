import { Request, Response, NextFunction } from "express";
import { categoryService } from "./category.service.js";
import { sendSuccess, sendError } from "../../utils/apiResponse.js";

export class CategoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const categories = await categoryService.getAll(userId);
      sendSuccess({ res, message: "Daftar kategori berhasil diambil", data: categories });
    } catch (error: any) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const category = await categoryService.create(userId, req.body);
      sendSuccess({ res, statusCode: 201, message: "Kategori berhasil ditambahkan", data: category });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const category = await categoryService.update(userId, req.params.id as string, req.body);
      sendSuccess({ res, message: "Kategori berhasil diperbarui", data: category });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      await categoryService.delete(userId, req.params.id as string);
      sendSuccess({ res, message: "Kategori berhasil dihapus" });
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.statusCode, error.message);
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
