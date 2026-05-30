import { CookieOptions, Request, Response } from "express";

export const AUTH_COOKIE_NAME = "watch_tracker_jwt";
export const AUTH_SESSION_TTL_SECONDS = 2 * 60 * 60;
export const AUTH_SESSION_TTL_MS = AUTH_SESSION_TTL_SECONDS * 1000;
export const AUTH_JWT_EXPIRES_IN = "2h";

function configuredSameSite(): CookieOptions["sameSite"] {
    const value = process.env.AUTH_COOKIE_SAME_SITE?.toLowerCase();

    if (value === "strict" || value === "lax" || value === "none") {
        return value;
    }

    return "lax";
}

function useSecureCookie(sameSite: CookieOptions["sameSite"]): boolean {
    if (process.env.NODE_ENV === "production" || sameSite === "none") {
        return true;
    }

    return process.env.AUTH_COOKIE_SECURE === "true";
}

export function authCookieOptions(): CookieOptions {
    const sameSite = configuredSameSite();
    const domain = process.env.AUTH_COOKIE_DOMAIN?.trim();

    return {
        httpOnly: true,
        secure: useSecureCookie(sameSite),
        sameSite,
        path: "/",
        maxAge: AUTH_SESSION_TTL_MS,
        ...(domain ? { domain } : {}),
    };
}

export function clearAuthCookie(res: Response): void {
    const { maxAge: _maxAge, ...options } = authCookieOptions();
    res.clearCookie(AUTH_COOKIE_NAME, options);
}

export function getAuthCookie(req: Request): string | null {
    const header = req.headers.cookie;
    if (!header) return null;

    for (const part of header.split(";")) {
        const [rawName, ...rawValue] = part.trim().split("=");
        if (!rawName || rawValue.length === 0) continue;

        if (decodeURIComponent(rawName) === AUTH_COOKIE_NAME) {
            return decodeURIComponent(rawValue.join("="));
        }
    }

    return null;
}
