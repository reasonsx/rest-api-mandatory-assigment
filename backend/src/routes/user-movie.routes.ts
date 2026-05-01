import { Router } from "express";
import {
    addMovieToUser,
    deleteUserMovie,
    getUserMovies,
    updateUserMovie,
} from "../controllers/user-movie.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const userMovieRouter = Router();

/**
 * @openapi
 * /users/{userId}/movies:
 *   post:
 *     summary: Add movie to user list
 *     tags: [User Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserMovieCreateRequest'
 *     responses:
 *       201:
 *         description: Movie added to user list
 */
userMovieRouter.post("/users/:userId/movies", requireAuth, addMovieToUser);

/**
 * @openapi
 * /users/{userId}/movies:
 *   get:
 *     summary: Get user's movies
 *     tags: [User Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user's movies
 */
userMovieRouter.get("/users/:userId/movies", requireAuth, getUserMovies);

/**
 * @openapi
 * /users/movies/{id}:
 *   patch:
 *     summary: Update user movie
 *     tags: [User Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserMovieUpdateRequest'
 *     responses:
 *       200:
 *         description: Updated user movie
 */
userMovieRouter.patch("/users/movies/:id", requireAuth, updateUserMovie);

/**
 * @openapi
 * /users/movies/{id}:
 *   delete:
 *     summary: Remove movie from user list
 *     tags: [User Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Movie removed
 */
userMovieRouter.delete("/users/movies/:id", requireAuth, deleteUserMovie);