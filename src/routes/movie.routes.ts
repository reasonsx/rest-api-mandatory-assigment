import {Router} from "express";
import {
    createMovie,
    deleteMovie,
    getMovieById,
    getMovies,
    updateMovie
} from "../controllers/movie.controller";
import {requireAdmin, requireAuth} from "../middlewares/auth.middleware";

export const movieRouter = Router();

/**
 * @openapi
 * /movies:
 *   get:
 *     summary: Get all movies
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: List of movies
 */
movieRouter.get("/", getMovies);

/**
 * @openapi
 * /movies:
 *   post:
 *     summary: Create a movie (admin only)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovieCreate'
 *     responses:
 *       201:
 *         description: Movie created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 */
movieRouter.post("/", requireAuth, requireAdmin, createMovie);

/**
 * @openapi
 * /movies/{id}:
 *   get:
 *     summary: Get movie by id
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie
 */
movieRouter.get("/:id", getMovieById);

/**
 * @openapi
 * /movies/{id}:
 *   patch:
 *     summary: Update movie (admin)
 *     tags: [Movies]
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
 *             $ref: '#/components/schemas/MovieUpdate'
 *     responses:
 *       200:
 *         description: Updated movie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Movie not found
 */
movieRouter.patch("/:id", requireAuth, requireAdmin, updateMovie);

/**
 * @openapi
 * /movies/{id}:
 *   delete:
 *     summary: Delete movie (admin)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 */
movieRouter.delete("/:id", requireAuth, requireAdmin, deleteMovie);