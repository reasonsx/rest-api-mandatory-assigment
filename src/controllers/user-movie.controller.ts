import { Request, Response } from "express";
import { Types } from "mongoose";
import { UserMovieModel } from "../models/user-movie.model";

function isObjectId(value: unknown): value is string {
  return typeof value === "string" && Types.ObjectId.isValid(value);
}

// POST /users/:userId/movies
export async function addMovieToUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { movieId, status } = req.body;

    if (!isObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    if (!isObjectId(movieId)) {
      return res.status(400).json({ message: "Invalid movieId" });
    }

    const existing = await UserMovieModel.findOne({ userId, movieId });
    if (existing) {
      return res.status(409).json({ message: "Movie already in user list" });
    }

    const created = await UserMovieModel.create({
      userId: new Types.ObjectId(userId),
      movieId: new Types.ObjectId(movieId),
      status: status ?? "planned",
    });

    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: "Failed to add movie", error: String(err) });
  }
}

// GET /users/:userId/movies
export async function getUserMovies(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    if (!isObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const items = await UserMovieModel.find({ userId })
      .populate("movieId")
      .sort({ createdAt: -1 });

    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch user movies", error: String(err) });
  }
}

// PATCH /users/movies/:id
export async function updateUserMovie(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!isObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const { status, watchedAt, rating, review } = req.body;

    const updated = await UserMovieModel.findByIdAndUpdate(
      id,
      { status, watchedAt, rating, review },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "User movie not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: "Failed to update user movie", error: String(err) });
  }
}

// DELETE /users/movies/:id
export async function deleteUserMovie(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!isObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const deleted = await UserMovieModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "User movie not found" });

    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ message: "Failed to delete user movie", error: String(err) });
  }
}