import { Request, Response } from "express";
import { MovieModel } from "./movie.model";
import { cleanMoviePayload, isObjectId } from "./movie.validation";
import {
    fieldError,
    RequestValidationError,
    sendError,
    sendServerError,
    sendValidationError,
} from "../../shared/api-response";
import { VALIDATION_MESSAGES } from "../../shared/validation-messages";

export async function createMovie(req: Request, res: Response) {
    try {
        const payload = cleanMoviePayload(req.body ?? {});

        const movie = await MovieModel.create({
            ...payload,
            adult: false,
        });

        return res.status(201).json(movie);
    } catch (err) {
        if (err instanceof RequestValidationError) {
            return sendValidationError(res, err.errors);
        }

        return sendServerError(res, "Failed to create movie.");
    }
}

export async function getMovies(_req: Request, res: Response) {
    try {
        const movies = await MovieModel.find({ adult: { $ne: true } }).sort({ createdAt: -1 });
        return res.json(movies);
    } catch {
        return sendServerError(res, "Failed to fetch movies.");
    }
}

export async function getMovieById(req: Request, res: Response) {
    try {
        if (!isObjectId(req.params.id)) {
            return sendValidationError(res, [
                fieldError("id", VALIDATION_MESSAGES.objectIdInvalid),
            ]);
        }

        const movie = await MovieModel.findById(req.params.id);

        if (!movie) {
            return sendError(res, 404, "Movie not found.");
        }

        return res.json(movie);
    } catch {
        return sendServerError(res, "Failed to fetch movie.");
    }
}

export async function updateMovie(req: Request, res: Response) {
    try {
        if (!isObjectId(req.params.id)) {
            return sendValidationError(res, [
                fieldError("id", VALIDATION_MESSAGES.objectIdInvalid),
            ]);
        }

        const payload = cleanMoviePayload(req.body ?? {}, true);

        if (!Object.keys(payload).length) {
            return sendError(res, 400, VALIDATION_MESSAGES.noUpdateFields);
        }

        const movie = await MovieModel.findByIdAndUpdate(req.params.id, payload, {
            new: true,
            runValidators: true,
        });

        if (!movie) {
            return sendError(res, 404, "Movie not found.");
        }

        return res.json(movie);
    } catch (err) {
        if (err instanceof RequestValidationError) {
            return sendValidationError(res, err.errors);
        }

        return sendServerError(res, "Failed to update movie.");
    }
}

export async function deleteMovie(req: Request, res: Response) {
    try {
        if (!isObjectId(req.params.id)) {
            return sendValidationError(res, [
                fieldError("id", VALIDATION_MESSAGES.objectIdInvalid),
            ]);
        }

        const movie = await MovieModel.findByIdAndDelete(req.params.id);

        if (!movie) {
            return sendError(res, 404, "Movie not found.");
        }

        return res.status(204).send();
    } catch {
        return sendServerError(res, "Failed to delete movie.");
    }
}
