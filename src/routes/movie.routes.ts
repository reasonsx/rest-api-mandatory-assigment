import { Router } from "express";
import { createMovie, deleteMovie, getMovieById, getMovies, updateMovie } from "../controllers/movie.controller";

export const movieRouter = Router();

movieRouter.post("/", createMovie);
movieRouter.get("/", getMovies);
movieRouter.get("/:id", getMovieById);
movieRouter.put("/:id", updateMovie);
movieRouter.delete("/:id", deleteMovie);