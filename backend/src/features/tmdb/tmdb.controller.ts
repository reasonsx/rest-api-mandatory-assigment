import { Request, Response } from "express";
import {getTmdbMovieDetails, searchTmdbMovies} from "./tmdb.service";
import {MovieModel} from "../movies/movie.model";
import { fieldError, sendError, sendServerError, sendValidationError } from "../../shared/api-response";
import { VALIDATION_MESSAGES } from "../../shared/validation-messages";

export async function searchMoviesFromTmdb(req: Request, res: Response) {
    try {
        const query = String(req.query.q ?? "").trim();

        if (!query) {
            return sendValidationError(res, [
                fieldError("q", "Search query is required."),
            ]);
        }

        const movies = await searchTmdbMovies(query);
        return res.json(movies);
    } catch {
        return sendServerError(res, "Failed to search TMDB.");
    }
}

export async function importMovieFromTmdb(req: Request, res: Response) {
    try {
        const tmdbId = Number(req.params.tmdbId);

        if (!Number.isInteger(tmdbId)) {
            return sendValidationError(res, [
                fieldError("tmdbId", "TMDB id must be a whole number."),
            ]);
        }

        const payload = await getTmdbMovieDetails(tmdbId);

        const movie = await MovieModel.create(payload);

        return res.status(201).json(movie);
    } catch (err) {
        if (err instanceof Error && err.message === VALIDATION_MESSAGES.adultMoviesBlocked) {
            return sendError(res, 400, VALIDATION_MESSAGES.adultMoviesBlocked);
        }

        return sendServerError(res, "Failed to import movie.");
    }
}
