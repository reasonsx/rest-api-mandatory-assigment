import { Router } from "express";
import { addMovieToUser, deleteUserMovie, getUserMovies, updateUserMovie } from "../controllers/user-movie.controller";

export const userMovieRouter = Router();

userMovieRouter.post("/users/:userId/movies", addMovieToUser);
userMovieRouter.get("/users/:userId/movies", getUserMovies);
userMovieRouter.patch("/users/movies/:id", updateUserMovie);
userMovieRouter.delete("/users/movies/:id", deleteUserMovie);