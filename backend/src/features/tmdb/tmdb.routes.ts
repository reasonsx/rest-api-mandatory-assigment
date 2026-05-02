import { Router } from 'express';
import { searchMoviesFromTmdb } from './tmdb.controller';

export const tmdbRouter = Router();

tmdbRouter.get('/search', searchMoviesFromTmdb);