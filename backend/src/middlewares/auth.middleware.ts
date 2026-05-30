import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { UserRole } from "../features/users/user.interface";
import { clearAuthCookie, getAuthCookie } from "../config/auth";
import { sendError, sendServerError } from "../shared/api-response";

type AuthPayload = JwtPayload & {
    sub?: unknown;
    email?: unknown;
    username?: unknown;
    role?: unknown;
};

export interface AuthRequest extends Request {
    user?: { id: string; email: string; username?: string; role: UserRole };
    auth?: { exp?: number };
}

function isUserRole(x: unknown): x is UserRole {
    return x === "user" || x === "admin";
}

function rejectInvalidToken(res: Response) {
    clearAuthCookie(res);
    return sendError(res, 401, "Invalid or expired session.");
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const token = getAuthCookie(req);

    if (!token) {
        return sendError(res, 401, "Authentication is required.");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return sendServerError(res, "Server misconfigured.");

    try {
        const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] }) as AuthPayload;

        if (typeof decoded.sub !== "string" || !Types.ObjectId.isValid(decoded.sub)) {
            return rejectInvalidToken(res);
        }
        if (typeof decoded.email !== "string") {
            return rejectInvalidToken(res);
        }
        if (!isUserRole(decoded.role)) {
            return rejectInvalidToken(res);
        }
        if (typeof decoded.exp !== "number") {
            return rejectInvalidToken(res);
        }

        req.user = {
            id: decoded.sub,
            email: decoded.email,
            username: typeof decoded.username === "string" ? decoded.username : undefined,
            role: decoded.role,
        };
        req.auth = { exp: decoded.exp };
        return next();
    } catch {
        return rejectInvalidToken(res);
    }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user) return sendError(res, 401, "Authentication is required.");
    if (req.user.role !== "admin") return sendError(res, 403, "Admin access is required.");
    return next();
}
