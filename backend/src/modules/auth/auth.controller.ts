import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import { sendSuccess, sendError } from "../../utils/apiResponse.js";
import { env } from "../../config/env.js";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      sendSuccess({ res, statusCode: 201, message: "Registrasi berhasil", data: user });
    } catch (error: any) {
      console.log('ERROR APA', error)
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      // Set refresh token di HttpOnly cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
      });

      sendSuccess({
        res,
        message: "Login berhasil",
        data: { user: result.user, accessToken: result.accessToken },
      });
    } catch (error: any) {
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      next(error);
    }
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie("refreshToken");
    sendSuccess({ res, message: "Logout berhasil" });
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const user = await authService.getProfile(userId);
      sendSuccess({ res, message: "Profil berhasil diambil", data: user });
    } catch (error: any) {
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken;

      if (!token) {
        return sendError(res, 401, "Refresh token tidak ditemukan");
      }

      const result = await authService.refreshToken(token);
      sendSuccess({ res, message: "Token berhasil di-refresh", data: result });
    } catch (error: any) {
      if (error.statusCode) {
        return sendError(res, error.statusCode, error.message);
      }
      next(error);
    }
  }
}

export const authController = new AuthController();
