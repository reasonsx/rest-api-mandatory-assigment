import { Router, Request, Response } from "express";
import { movieRouter } from "./routes/movie.routes";
import { userMovieRouter } from "./routes/user-movie.routes";
import { authRouter } from "./routes/auth.routes";
const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).send("Welcome to the API!");
});

router.use("/auth", authRouter);
router.use("/movies", movieRouter);
router.use("/", userMovieRouter);

export default router;