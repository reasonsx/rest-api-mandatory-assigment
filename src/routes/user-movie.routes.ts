import { Router } from "express";
import {
    addMovieToUser,
    deleteUserMovie,
    getUserMovies,
    updateUserMovie,
} from "../controllers/user-movie.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const userMovieRouter = Router();

userMovieRouter.post("/users/:userId/movies", requireAuth, addMovieToUser);
userMovieRouter.get("/users/:userId/movies", requireAuth, getUserMovies);
userMovieRouter.patch("/users/movies/:id", requireAuth, updateUserMovie);
userMovieRouter.delete("/users/movies/:id", requireAuth, deleteUserMovie);