import { Request, Response } from "express";
import { MovieModel } from "../models/movie.model";

export async function createMovie(req: Request, res: Response) {
  try {
    const { title, year, genres, posterUrl } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "title is required" });
    }

    const created = await MovieModel.create({ title, year, genres, posterUrl });
    console.log("content-type:", req.headers["content-type"]);
console.log("raw body:", req.body);
    return res.status(201).json(created);
    
  } catch (err) {
    return res.status(500).json({ message: "Failed to create movie", error: String(err) });
  }
}

export async function getMovies(_req: Request, res: Response) {
  try {
    const movies = await MovieModel.find().sort({ createdAt: -1 });
    return res.json(movies);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch movies", error: String(err) });
  }
}

export async function getMovieById(req: Request, res: Response) {
  try {
    const movie = await MovieModel.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    return res.json(movie);
  } catch (err) {
    return res.status(400).json({ message: "Invalid movie id", error: String(err) });
  }
}

export async function updateMovie(req: Request, res: Response) {
  try {
    const { title, year, genres, posterUrl } = req.body;

    const updated = await MovieModel.findByIdAndUpdate(
      req.params.id,
      { title, year, genres, posterUrl },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Movie not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: "Failed to update movie", error: String(err) });
  }
}

export async function deleteMovie(req: Request, res: Response) {
  try {
    const deleted = await MovieModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Movie not found" });
    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ message: "Failed to delete movie", error: String(err) });
  }
}