import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserModel } from "../models/user.model";
import { UserRole } from "../interfaces/user.interface";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is missing in environment variables`);
  return v;
}

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

export async function register(req: Request<{}, {}, RegisterRequest>, res: Response) {
  try {
    const { email, password, username } = req.body ?? ({} as RegisterRequest);

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "email and password must be strings" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "password must be at least 8 characters" });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await UserModel.create({
      email,
      username,
      passwordHash,
      role: "user", // ✅ always user on register
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
    const { email, password } = req.body ?? ({} as LoginRequest);

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    // ✅ must select passwordHash because schema has select:false
    const user = await UserModel.findOne({ email }).select("+passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const secret = requireEnv("JWT_SECRET");
    const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

    const token = jwt.sign(
        { sub: user._id.toString(), email: user.email, role: user.role as UserRole }, // ✅ include role
        secret,
        { expiresIn }
    );

    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: "Failed to login", error: String(err) });
  }
}