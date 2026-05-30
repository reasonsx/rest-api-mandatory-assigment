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
import {
  fieldError,
  RequestValidationError,
  sendError,
  sendServerError,
  sendValidationError,
} from "../../shared/api-response";
import { VALIDATION_MESSAGES } from "../../shared/validation-messages";
import { validateLoginBody, validateRegisterBody } from "./auth.validation";

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

export async function register(req: Request<{}, {}, RegisterRequest>, res: Response) {
  try {
    const body = validateRegisterBody(req.body);

    const existing = await UserModel.findOne({ email: body.email });
    if (existing) {
      return sendError(res, 409, VALIDATION_MESSAGES.emailAlreadyRegistered, [
        fieldError("email", VALIDATION_MESSAGES.emailAlreadyRegistered),
      ]);
    }

    const saltRounds = Math.min(Math.max(Number(process.env.BCRYPT_ROUNDS ?? 12), 10), 14);
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const created = await UserModel.create({
      email: body.email,
      username: body.username,
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
    if (err instanceof RequestValidationError) {
      return sendValidationError(res, err.errors);
    }

    return sendServerError(res, "Failed to register.");
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
    const body = validateLoginBody(req.body);

    const user = await UserModel.findOne({ email: body.email }).select("+passwordHash");
    if (!user) return sendError(res, 401, "Invalid email or password.");

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return sendError(res, 401, "Invalid email or password.");

    const secret = process.env.JWT_SECRET;
    if (!secret) return sendServerError(res, "Server misconfigured.");

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
        { algorithm: "HS256", expiresIn }
    );

    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions());
    return res.json(createAuthResponse(authUser, Date.now() + AUTH_SESSION_TTL_MS));
  } catch (err) {
    if (err instanceof RequestValidationError) {
      return sendValidationError(res, err.errors);
    }

    return sendServerError(res, "Failed to login.");
  }
}

export function me(req: AuthRequest, res: Response<AuthResponse | any>) {
  if (!req.user) return sendError(res, 401, "Authentication is required.");

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
