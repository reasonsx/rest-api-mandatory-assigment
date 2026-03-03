import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRole } from "../interfaces/user.interface";

type AuthPayload = JwtPayload & {
    sub: string;
    email: string;
    role: UserRole;
};

function requireEnv(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`${name} is missing in environment variables`);
    return v;
}

// Extend Express Request to include user
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: UserRole;
    };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const header = req.headers.authorization;

        if (!header?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing or invalid Authorization header" });
        }

        const token = header.slice("Bearer ".length).trim();
        const secret = requireEnv("JWT_SECRET");

        const decoded = jwt.verify(token, secret) as AuthPayload;

        req.user = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
        };

        return next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
    }
    return next();
}