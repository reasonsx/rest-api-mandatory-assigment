import {Request, Response} from "express";
import {Types} from "mongoose";
import {MovieModel} from "../models/movie.model";

const MIN_YEAR = 1878;
const MAX_YEAR = new Date().getFullYear() + 1;

function isValidYear(y: unknown): y is number {
    return typeof y === "number" && Number.isFinite(y) && y >= MIN_YEAR && y <= MAX_YEAR;
}

export async function createMovie(req: Request, res: Response) {
    try {
        const body = req.body ?? {};
        const {title, year, genres, posterUrl} = body;

        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({message: "title is required and must be a non-empty string"});
        }

        if (year !== undefined && !isValidYear(year)) {
            return res.status(400).json({message: `year must be between ${MIN_YEAR} and ${MAX_YEAR}`});
        }

        let cleanedGenres: string[] | undefined = undefined;
        if (genres !== undefined) {
            if (!Array.isArray(genres) || !genres.every((g: unknown) => typeof g === "string")) {
                return res.status(400).json({message: "genres must be an array of strings"});
            }
            cleanedGenres = Array.from(new Set(genres.map((g: string) => g.trim()).filter(Boolean)));
        }

        let cleanedPosterUrl: string | undefined = undefined;
        if (posterUrl !== undefined) {
            if (typeof posterUrl !== "string") {
                return res.status(400).json({message: "posterUrl must be a string"});
            }
            cleanedPosterUrl = posterUrl.trim();
        }

        const created = await MovieModel.create({
            title: title.trim(),
            year,
            genres: cleanedGenres ?? [],
            posterUrl: cleanedPosterUrl,
        });

        return res.status(201).json(created);
    } catch (err) {
        return res.status(500).json({message: "Failed to create movie", error: String(err)});
    }
}

export async function getMovies(_req: Request, res: Response) {
    try {
        const movies = await MovieModel.find().sort({createdAt: -1});
        return res.json(movies);
    } catch (err) {
        return res.status(500).json({message: "Failed to fetch movies", error: String(err)});
    }
}

export async function getMovieById(req: Request, res: Response) {
    try {
        const {id} = req.params;

        if (!isObjectId(id)) {
            return res.status(400).json({message: "Invalid movie id"});
        }

        const movie = await MovieModel.findById(id);
        if (!movie) return res.status(404).json({message: "Movie not found"});

        return res.json(movie);
    } catch (err) {
        return res.status(500).json({message: "Failed to fetch movie", error: String(err)});
    }
}

function isObjectId(value: unknown): value is string {
    return typeof value === "string" && Types.ObjectId.isValid(value);
}

export async function updateMovie(req: Request, res: Response) {
    try {
        const {id} = req.params;

        if (!isObjectId(id)) {
            return res.status(400).json({message: "Invalid movie id"});
        }

        const body = req.body ?? {};
        const patch: Record<string, unknown> = {};

        // title
        if (body.title !== undefined) {
            if (typeof body.title !== "string" || !body.title.trim()) {
                return res.status(400).json({message: "title must be a non-empty string"});
            }
            patch.title = body.title.trim();
        }

        // year
        if (body.year !== undefined) {
            if (!isValidYear(body.year)) {
                return res.status(400).json({message: `year must be between ${MIN_YEAR} and ${MAX_YEAR}`});
            }
            patch.year = body.year;
        }

        // genres
        if (body.genres !== undefined) {
            if (!Array.isArray(body.genres) || !body.genres.every((g: unknown) => typeof g === "string")) {
                return res.status(400).json({message: "genres must be an array of strings"});
            }
            patch.genres = Array.from(
                new Set(body.genres.map((g: string) => g.trim()).filter(Boolean))
            );
        }

        // posterUrl
        if (body.posterUrl !== undefined) {
            if (typeof body.posterUrl !== "string") {
                return res.status(400).json({message: "posterUrl must be a string"});
            }
            patch.posterUrl = body.posterUrl.trim();
        }

        if (Object.keys(patch).length === 0) {
            return res.status(400).json({message: "No valid fields provided to update"});
        }

        const updated = await MovieModel.findByIdAndUpdate(id, patch, {
            new: true,
            runValidators: true,
        });

        if (!updated) return res.status(404).json({message: "Movie not found"});
        return res.json(updated);
    } catch (err) {
        return res.status(500).json({message: "Failed to update movie", error: String(err)});
    }
}

export async function deleteMovie(req: Request, res: Response) {
    try {
        const {id} = req.params;

        if (!isObjectId(id)) {
            return res.status(400).json({message: "Invalid movie id"});
        }

        const deleted = await MovieModel.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({message: "Movie not found"});

        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({message: "Failed to delete movie", error: String(err)});
    }
}