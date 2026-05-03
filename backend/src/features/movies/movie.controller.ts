import { Request, Response } from "express";
import { MovieModel } from "./movie.model";
import { cleanMoviePayload, isObjectId } from "./movie.validation";

export async function createMovie(req: Request, res: Response) {
    try {
        const payload = cleanMoviePayload(req.body ?? {});

        if (payload.adult === true) {
            return res.status(400).json({ message: 'Adult movies are not allowed' });
        }

        const movie = await MovieModel.create({
            ...payload,
            adult: false,
        });

        return res.status(201).json(movie);
    } catch (err) {
        return res.status(400).json({ message: String(err).replace('Error: ', '') });
    }
}

export async function getMovies(_req: Request, res: Response) {
    try {
        const movies = await MovieModel.find({ adult: { $ne: true } }).sort({ createdAt: -1 });
        return res.json(movies);
    } catch {
        return res.status(500).json({ message: 'Failed to fetch movies' });
    }
}

export async function getMovieById(req: Request, res: Response) {
    try {
        if (!isObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid movie id" });
        }

        const movie = await MovieModel.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        return res.json(movie);
    } catch {
        return res.status(500).json({ message: "Failed to fetch movie" });
    }
}

export async function updateMovie(req: Request, res: Response) {
    try {
        if (!isObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid movie id" });
        }

        const payload = cleanMoviePayload(req.body ?? {}, true);

        if (!Object.keys(payload).length) {
            return res.status(400).json({ message: "No valid fields provided to update" });
        }

        const movie = await MovieModel.findByIdAndUpdate(req.params.id, payload, {
            new: true,
            runValidators: true,
        });

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        return res.json(movie);
    } catch (err) {
        return res.status(400).json({ message: String(err).replace("Error: ", "") });
    }
}

export async function deleteMovie(req: Request, res: Response) {
    try {
        if (!isObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid movie id" });
        }

        const movie = await MovieModel.findByIdAndDelete(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        return res.status(204).send();
    } catch {
        return res.status(500).json({ message: "Failed to delete movie" });
    }
}