import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

export const generalLimiter = env.NODE_ENV === "test"
  ? (req: any, res: any, next: any) => next()
  : rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000, // Tingkatkan untuk development
    message: { success: false, message: "Too many requests, please try again later" },
  });

export const authLimiter = env.NODE_ENV === "test"
  ? (req: any, res: any, next: any) => next()
  : rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Tingkatkan untuk development
    message: { success: false, message: "Too many login attempts, please try again later" },
  });
