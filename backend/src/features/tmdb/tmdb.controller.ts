import { Request, Response } from "express";
import { searchTmdbMovies } from "./tmdb.service";

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