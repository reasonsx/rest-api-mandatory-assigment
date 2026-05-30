import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRole } from "../features/users/user.interface";
import { clearAuthCookie, getAuthCookie } from "../config/auth";

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
    return res.status(401).json({ message: "Invalid or expired token" });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const token = getAuthCookie(req);

    if (!token) {
        return res.status(401).json({ message: "Missing authentication cookie" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "Server misconfigured" });

    try {
        const decoded = jwt.verify(token, secret) as AuthPayload;

        if (typeof decoded.sub !== "string") {
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
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    return next();
}
