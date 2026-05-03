import { Request, Response } from "express";
import {getTmdbMovieDetails, searchTmdbMovies} from "./tmdb.service";
import {MovieModel} from "../movies/movie.model";

export async function searchMoviesFromTmdb(req: Request, res: Response) {
    try {
        const query = String(req.query.q ?? "").trim();

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const movies = await searchTmdbMovies(query);
        return res.json(movies);
    } catch {
        return res.status(500).json({ message: "Failed to search TMDB" });
    }
}

export async function importMovieFromTmdb(req: Request, res: Response) {
    try {
        const tmdbId = Number(req.params.tmdbId);

        if (!Number.isInteger(tmdbId)) {
            return res.status(400).json({ message: 'Invalid TMDB id' });
        }

        const payload = await getTmdbMovieDetails(tmdbId);

        const movie = await MovieModel.create(payload);

        return res.status(201).json(movie);
    } catch (err) {
        return res.status(400).json({ message: String(err).replace('Error: ', '') });
    }
}