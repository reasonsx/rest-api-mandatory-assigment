import { Router } from 'express';
import {importMovieFromTmdb, searchMoviesFromTmdb} from './tmdb.controller';
import {requireAdmin, requireAuth} from "../../middlewares/auth.middleware";

export const tmdbRouter = Router();

tmdbRouter.get('/search', searchMoviesFromTmdb);
tmdbRouter.post('/import/:tmdbId', requireAuth, requireAdmin, importMovieFromTmdb);