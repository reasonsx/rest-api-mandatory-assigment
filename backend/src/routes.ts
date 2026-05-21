import { Router, Request, Response } from "express";
import { movieRouter } from "./features/movies/movie.routes";
import { userMovieRouter } from "./features/user-movies/user-movie.routes";
import { authRouter } from "./features/auth/auth.routes";
import {tmdbRouter} from "./features/tmdb/tmdb.routes";
import { userRouter } from "./features/users/user.routes";
const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).send("Welcome to the API!");
});

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/movies", movieRouter);
router.use("/", userMovieRouter);
router.use('/tmdb', tmdbRouter);

export default router;