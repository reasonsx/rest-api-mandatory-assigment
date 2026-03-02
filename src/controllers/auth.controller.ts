import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user.model";
import jwt, { SignOptions } from "jsonwebtoken";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is missing in environment variables`);
  return v;
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, username } = (req.body ?? {}) as {
      email?: string;
      password?: string;
      username?: string;
    };

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
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await UserModel.create({
      email,
      username,
      passwordHash,
    });

    return res.status(201).json({
      id: created._id.toString(),
      email: created.email,
      username: created.username,
      createdAt: created.createdAt,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to register", error: String(err) });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = (req.body ?? {}) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const secret = requireEnv("JWT_SECRET");

    const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

    const token = jwt.sign(
    { sub: user._id.toString(), email: user.email },
    secret,
    { expiresIn }
    );

    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: "Failed to login", error: String(err) });
  }
}