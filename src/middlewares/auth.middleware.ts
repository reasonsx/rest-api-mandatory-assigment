import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRole } from "../interfaces/user.interface";

type AuthPayload = JwtPayload & {
    sub?: unknown;
    email?: unknown;
    role?: unknown;
};

export interface AuthRequest extends Request {
    user?: { id: string; email: string; role: UserRole };
}

function isUserRole(x: unknown): x is UserRole {
    return x === "user" || x === "admin";
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }

    const token = header.slice("Bearer ".length).trim();
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "Server misconfigured" });

    try {
        const decoded = jwt.verify(token, secret) as AuthPayload;

        if (typeof decoded.sub !== "string") {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        if (typeof decoded.email !== "string") {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        if (!isUserRole(decoded.role)) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        req.user = { id: decoded.sub, email: decoded.email, role: decoded.role };
        return next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    return next();
}