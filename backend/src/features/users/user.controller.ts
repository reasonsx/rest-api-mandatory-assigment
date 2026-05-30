import { Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { UserModel } from "./user.model";
import {
    fieldError,
    RequestValidationError,
    sendError,
    sendServerError,
    sendValidationError,
} from "../../shared/api-response";
import { VALIDATION_MESSAGES } from "../../shared/validation-messages";
import { validateProfileUpdateBody } from "./user.validation";

export async function getProfile(req: AuthRequest, res: Response) {
    try {
        const userId = String(req.params.userId ?? "");

        if (!Types.ObjectId.isValid(userId)) {
            return sendValidationError(res, [
                fieldError("userId", VALIDATION_MESSAGES.objectIdInvalid),
            ]);
        }

        if (!req.user || (req.user.id !== userId && req.user.role !== "admin")) {
            return sendError(res, 403, "Forbidden.");
        }

        const user = await UserModel.findById(userId).select("-passwordHash");
        if (!user) return sendError(res, 404, "User not found.");
        return res.json(user);
    } catch {
        return sendServerError(res, "Failed to fetch profile.");
    }
}

export async function updateProfile(req: AuthRequest, res: Response) {
    try {
        const userId = String(req.params.userId ?? "");

        if (!Types.ObjectId.isValid(userId)) {
            return sendValidationError(res, [
                fieldError("userId", VALIDATION_MESSAGES.objectIdInvalid),
            ]);
        }

        // Ensure user is updating their own profile or is an admin
        if (!req.user || (req.user.id !== userId && req.user.role !== 'admin')) {
            return sendError(res, 403, "Forbidden.");
        }

        const update = validateProfileUpdateBody(req.body);

        const user = await UserModel.findByIdAndUpdate(
            userId,
            { $set: update },
            { new: true, runValidators: true }
        ).select("-passwordHash");

        if (!user) return sendError(res, 404, "User not found.");

        return res.json(user);
    } catch (err) {
        if (err instanceof RequestValidationError) {
            return sendValidationError(res, err.errors);
        }

        return sendServerError(res, "Failed to update profile.");
    }
}
