import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/database.js";
import { env } from "../../config/env.js";
import { RegisterInput, LoginInput } from "./auth.schema.js";

const SALT_ROUNDS = 12;

export class AuthService {
  async register(data: RegisterInput) {
    // Cek apakah email sudah terdaftar
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw { statusCode: 409, message: "Email sudah terdaftar" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Buat user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(data: LoginInput) {
    // Cari user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw { statusCode: 401, message: "Email atau password salah" };
    }

    // Verifikasi password
    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      throw { statusCode: 401, message: "Email atau password salah" };
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
      },
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, message: "User tidak ditemukan" };
    }

    return user;
  }

  async refreshToken(token: string) {
    try {
      const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
        userId: string;
      };

      const accessToken = this.generateAccessToken(payload.userId);
      return { accessToken };
    } catch {
      throw { statusCode: 401, message: "Refresh token tidak valid" };
    }
  }

  private generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });
  }
}

export const authService = new AuthService();
