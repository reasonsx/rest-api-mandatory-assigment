import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserModel } from "../users/user.model";
import { UserRole } from "../users/user.interface";
import {
  AUTH_COOKIE_NAME,
  AUTH_JWT_EXPIRES_IN,
  AUTH_SESSION_TTL_MS,
  authCookieOptions,
  clearAuthCookie,
} from "../../config/auth";
import { AuthRequest } from "../../middlewares/auth.middleware";

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export async function register(req: Request<{}, {}, RegisterRequest>, res: Response) {
  try {
    const body = req.body ?? ({} as RegisterRequest);

    if (typeof body.email !== "string" || typeof body.password !== "string") {
      return res.status(400).json({ message: "email and password must be strings" });
    }

    const email = body.email.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "email must be valid" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "password must be at least 8 characters" });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const saltRounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const created = await UserModel.create({
      email,
      username: typeof body.username === "string" ? body.username.trim() : undefined,
      passwordHash,
      role: "user",
    });

    return res.status(201).json({
      id: created._id.toString(),
      email: created.email,
      username: created.username,
      role: created.role,
      createdAt: created.createdAt,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to register", error: String(err) });
  }
}

function createAuthResponse(user: AuthUser, expiresAtMs: number): AuthResponse {
  return {
    user,
    expiresAt: new Date(expiresAtMs).toISOString(),
    expiresInSeconds: Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000)),
  };
}

export async function login(req: Request<{}, {}, LoginRequest>, res: Response<AuthResponse | any>) {
  try {
    const body = req.body ?? ({} as LoginRequest);

    if (typeof body.email !== "string" || typeof body.password !== "string") {
      return res.status(400).json({ message: "email and password are required" });
    }

    const email = body.email.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await UserModel.findOne({ email }).select("+passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "Server misconfigured" });

    const expiresIn = AUTH_JWT_EXPIRES_IN as SignOptions["expiresIn"];
    const authUser: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role as UserRole,
    };

    const token = jwt.sign(
        {
          sub: authUser.id,
          email: authUser.email,
          username: authUser.username,
          role: authUser.role,
        },
        secret,
        { expiresIn }
    );

    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions());
    return res.json(createAuthResponse(authUser, Date.now() + AUTH_SESSION_TTL_MS));
  } catch (err) {
    return res.status(500).json({ message: "Failed to login", error: String(err) });
  }
}

export function me(req: AuthRequest, res: Response<AuthResponse | any>) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const expiresAtMs = req.auth?.exp ? req.auth.exp * 1000 : Date.now() + AUTH_SESSION_TTL_MS;

  return res.json(
    createAuthResponse(
      {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        role: req.user.role,
      },
      expiresAtMs
    )
  );
}

export function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  return res.status(204).send();
}
