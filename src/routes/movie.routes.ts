import { Router } from "express";
import {
    createMovie,
    deleteMovie,
    getMovieById,
    getMovies,
    updateMovie,
} from "../controllers/movie.controller";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware";

export const movieRouter = Router();

// Public
movieRouter.get("/", getMovies);
movieRouter.get("/:id", getMovieById);

// Admin only
movieRouter.post("/", requireAuth, requireAdmin, createMovie);
movieRouter.put("/:id", requireAuth, requireAdmin, updateMovie);
movieRouter.delete("/:id", requireAuth, requireAdmin, deleteMovie);