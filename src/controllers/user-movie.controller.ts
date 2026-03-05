import {Response} from "express";
import {Types} from "mongoose";
import {UserMovieModel} from "../models/user-movie.model";
import {AuthRequest} from "../middlewares/auth.middleware";

function isObjectId(value: unknown): value is string {
    return typeof value === "string" && Types.ObjectId.isValid(value);
}

export async function addMovieToUser(req: AuthRequest, res: Response) {
    try {
        const {userId} = req.params;
        const {movieId, status} = req.body;

        if (!isObjectId(userId)) return res.status(400).json({message: "Invalid userId"});
        if (!isObjectId(movieId)) return res.status(400).json({message: "Invalid movieId"});

        if (!req.user || (req.user.role !== "admin" && req.user.id !== userId)) {
            return res.status(403).json({message: "Forbidden"});
        }

        if (status !== undefined && !isStatus(status)) {
            return res.status(400).json({message: "Invalid status"});
        }

        const created = await UserMovieModel.create({
            userId: new Types.ObjectId(userId),
            movieId: new Types.ObjectId(movieId),
            status: status ?? "planned",
        });

        return res.status(201).json(created);
    } catch (err: any) {
        if (err?.code === 11000) {
            return res.status(409).json({message: "Movie already in user list"});
        }
        return res.status(500).json({message: "Failed to add movie", error: String(err)});
    }
}

export async function getUserMovies(req: AuthRequest, res: Response) {
    try {
        const {userId} = req.params;

        if (!isObjectId(userId)) {
            return res.status(400).json({message: "Invalid userId"});
        }

        if (!req.user || (req.user.role !== "admin" && req.user.id !== userId)) {
            return res.status(403).json({message: "Forbidden"});
        }

        const items = await UserMovieModel.find({userId})
            .populate("movieId")
            .sort({createdAt: -1});

        return res.json(items);
    } catch (err) {
        return res.status(500).json({message: "Failed to fetch user movies", error: String(err)});
    }
}

const VALID_STATUS = new Set(["planned", "watching", "watched"] as const);
type WatchStatus = "planned" | "watching" | "watched";

function isStatus(x: unknown): x is WatchStatus {
    return typeof x === "string" && (VALID_STATUS as Set<string>).has(x);
}

function isISODateString(x: unknown): x is string {
    return typeof x === "string" && !Number.isNaN(Date.parse(x));
}

export async function updateUserMovie(req: AuthRequest, res: Response) {
    try {
        const {id} = req.params;

        if (!isObjectId(id)) return res.status(400).json({message: "Invalid id"});
        if (!req.user) return res.status(401).json({message: "Unauthorized"});

        const body = req.body ?? {};
        const $set: Record<string, unknown> = {};
        const $unset: Record<string, unknown> = {};

        // status
        if (body.status !== undefined) {
            if (!isStatus(body.status)) {
                return res.status(400).json({message: "Invalid status"});
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
                return res.status(400).json({message: "watchedAt can only be set when status is 'watched'"});
            }

            if (!isISODateString(body.watchedAt)) {
                return res.status(400).json({message: "watchedAt must be an ISO date-time string"});
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
                return res.status(400).json({message: "rating must be a number between 1 and 10"});
            }
            $set.rating = body.rating;
        }

        // review
        if (body.review !== undefined) {
            if (typeof body.review !== "string") {
                return res.status(400).json({message: "review must be a string"});
            }
            const trimmed = body.review.trim();
            if (trimmed.length > 2000) {
                return res.status(400).json({message: "review must be at most 2000 characters"});
            }
            $set.review = trimmed;
        }

        // build update doc
        const updateDoc: any = {};
        if (Object.keys($set).length) updateDoc.$set = $set;
        if (Object.keys($unset).length) updateDoc.$unset = $unset;

        if (!Object.keys(updateDoc).length) {
            return res.status(400).json({message: "No valid fields provided to update"});
        }

        const filter =
            req.user.role === "admin"
                ? {_id: id}
                : {_id: id, userId: new Types.ObjectId(req.user.id)};

        const updated = await UserMovieModel.findOneAndUpdate(filter, updateDoc, {
            new: true,
            runValidators: true,
        });

        if (!updated) return res.status(404).json({message: "User movie not found"});
        return res.json(updated);
    } catch (err) {
        return res.status(500).json({message: "Failed to update user movie", error: String(err)});
    }
}

export async function deleteUserMovie(req: AuthRequest, res: Response) {
    try {
        const {id} = req.params;
        if (!isObjectId(id)) return res.status(400).json({message: "Invalid id"});

        if (!req.user) return res.status(401).json({message: "Unauthorized"});

        const filter =
            req.user.role === "admin"
                ? {_id: id}
                : {_id: id, userId: new Types.ObjectId(req.user.id)};

        const deleted = await UserMovieModel.findOneAndDelete(filter);
        if (!deleted) return res.status(404).json({message: "User movie not found"});

        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({message: "Failed to delete user movie", error: String(err)});
    }
}