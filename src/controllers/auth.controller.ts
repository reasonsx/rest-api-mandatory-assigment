import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserModel } from "../models/user.model";
import { UserRole } from "../interfaces/user.interface";

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
  token: string;
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

    const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

    const token = jwt.sign(
        { sub: user._id.toString(), email: user.email, role: user.role as UserRole },
        secret,
        { expiresIn }
    );

    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: "Failed to login", error: String(err) });
  }
}