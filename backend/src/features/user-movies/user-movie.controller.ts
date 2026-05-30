import {Response} from "express";
import {Types} from "mongoose";
import {UserMovieModel} from "./user-movie.model";
import type {WatchStatus} from "./user-movie.interface";
import {AuthRequest} from "../../middlewares/auth.middleware";
import {
    fieldError,
    sendError,
    sendServerError,
    sendValidationError,
} from "../../shared/api-response";
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from "../../shared/validation-messages";

function isObjectId(value: unknown): value is string {
    return typeof value === "string" && Types.ObjectId.isValid(value);
}

export async function addMovieToUser(req: AuthRequest, res: Response) {
    try {
        const {userId} = req.params;
        const {movieId, status} = req.body;

        if (!isObjectId(userId)) {
            return sendValidationError(res, [
                fieldError("userId", VALIDATION_MESSAGES.objectIdInvalid),
            ]);
        }
        if (!isObjectId(movieId)) {
            return sendValidationError(res, [
                fieldError("movieId", VALIDATION_MESSAGES.objectIdInvalid),
            ]);
        }

        if (!req.user || (req.user.role !== "admin" && req.user.id !== userId)) {
            return sendError(res, 403, "Forbidden.");
        }

        if (status !== undefined && !isStatus(status)) {
            return sendValidationError(res, [
                fieldError("status", VALIDATION_MESSAGES.statusInvalid),
            ]);
        }

        const watchStatus: WatchStatus = status === undefined ? "planned" : status;

        const created = await UserMovieModel.create({
            userId: new Types.ObjectId(userId),
            movieId: new Types.ObjectId(movieId),
            status: watchStatus,
            ...(watchStatus === "watched" ? {watchedAt: new Date()} : {}),
        });

        return res.status(201).json(created);
    } catch (err: any) {
        if (err?.code === 11000) {
            return sendError(res, 409, "Movie is already in your list.");
        }
        return sendServerError(res, "Failed to add movie.");
    }
}

export async function getUserMovies(req: AuthRequest, res: Response) {
    try {
        const {userId} = req.params;

        if (!isObjectId(userId)) {
            return sendValidationError(res, [
                fieldError("userId", VALIDATION_MESSAGES.objectIdInvalid),
            ]);
        }

        if (!req.user || (req.user.role !== "admin" && req.user.id !== userId)) {
            return sendError(res, 403, "Forbidden.");
        }

        const items = await UserMovieModel.find({userId})
            .populate("movieId")
            .sort({createdAt: -1});

        return res.json(items);
    } catch (err) {
        return sendServerError(res, "Failed to fetch user movies.");
    }
}

const VALID_STATUS = new Set(["planned", "watched"] as const);

function isStatus(x: unknown): x is WatchStatus {
    return typeof x === "string" && (VALID_STATUS as Set<string>).has(x);
}

function isISODateString(x: unknown): x is string {
    return typeof x === "string" && !Number.isNaN(Date.parse(x));
}

export async function updateUserMovie(req: AuthRequest, res: Response) {
    try {
        const {id} = req.params;

        if (!isObjectId(id)) {
            return sendValidationError(res, [
                fieldError("id", VALIDATION_MESSAGES.objectIdInvalid),
            ]);
        }
        if (!req.user) return sendError(res, 401, "Authentication is required.");

        const body = req.body ?? {};
        const $set: Record<string, unknown> = {};
        const $unset: Record<string, unknown> = {};

        // status
        if (body.status !== undefined) {
            if (!isStatus(body.status)) {
                return sendValidationError(res, [
                    fieldError("status", VALIDATION_MESSAGES.statusInvalid),
                ]);
            }
            $set.status = body.status;

            // If status is watched and watchedAt not provided -> set now
            if (body.status === "watched" && body.watchedAt === undefined) {
                $set.watchedAt = new Date();
            }

            // If moving away from watched -> clear watchedAt
            if (body.status !== "watched") {
                $unset.watchedAt = "";
            }
        }

        if (body.watchedAt !== undefined) {
            // prevent $set + $unset conflict
            if ($unset.watchedAt !== undefined) {
                return sendValidationError(res, [
                    fieldError("watchedAt", VALIDATION_MESSAGES.watchedAtStatusConflict),
                ]);
            }

            if (!isISODateString(body.watchedAt)) {
                return sendValidationError(res, [
                    fieldError("watchedAt", VALIDATION_MESSAGES.watchedAtInvalid),
                ]);
            }

            $set.watchedAt = new Date(body.watchedAt);
        }

        // rating
        if (body.rating !== undefined) {
            if (
                typeof body.rating !== "number" ||
                !Number.isFinite(body.rating) ||
                body.rating < 1 ||
                body.rating > 10
            ) {
                return sendValidationError(res, [
                    fieldError("rating", VALIDATION_MESSAGES.ratingInvalid),
                ]);
            }
            $set.rating = body.rating;
        }

        // review
        if (body.review !== undefined) {
            if (typeof body.review !== "string") {
                return sendValidationError(res, [
                    fieldError("review", VALIDATION_MESSAGES.reviewInvalid),
                ]);
            }
            const trimmed = body.review.trim();
            if (trimmed.length > VALIDATION_LIMITS.reviewMaxLength) {
                return sendValidationError(res, [
                    fieldError("review", VALIDATION_MESSAGES.reviewMaxLength),
                ]);
            }
            $set.review = trimmed;
        }

        // build update doc
        const updateDoc: any = {};
        if (Object.keys($set).length) updateDoc.$set = $set;
        if (Object.keys($unset).length) updateDoc.$unset = $unset;

        if (!Object.keys(updateDoc).length) {
            return sendError(res, 400, VALIDATION_MESSAGES.noUpdateFields);
        }

        const filter =
            req.user.role === "admin"
                ? {_id: id}
                : {_id: id, userId: new Types.ObjectId(req.user.id)};

        const updated = await UserMovieModel.findOneAndUpdate(filter, updateDoc, {
            new: true,
            runValidators: true,
        });

        if (!updated) return sendError(res, 404, "User movie not found.");
        return res.json(updated);
    } catch (err) {
        return sendServerError(res, "Failed to update user movie.");
    }
}

export async function deleteUserMovie(req: AuthRequest, res: Response) {
    try {
        const {id} = req.params;
        if (!isObjectId(id)) {
            return sendValidationError(res, [
                fieldError("id", VALIDATION_MESSAGES.objectIdInvalid),
            ]);
        }

        if (!req.user) return sendError(res, 401, "Authentication is required.");

        const filter =
            req.user.role === "admin"
                ? {_id: id}
                : {_id: id, userId: new Types.ObjectId(req.user.id)};

        const deleted = await UserMovieModel.findOneAndDelete(filter);
        if (!deleted) return sendError(res, 404, "User movie not found.");

        return res.status(204).send();
    } catch (err) {
        return sendServerError(res, "Failed to delete user movie.");
    }
}
