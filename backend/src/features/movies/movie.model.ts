import { Schema, model } from 'mongoose';
import { Movie } from './movie.interface';

const MIN_YEAR = 1878;
const MAX_YEAR = new Date().getFullYear() + 1;

const movieSchema = new Schema<Movie>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 200,
        },

        year: {
            type: Number,
            min: MIN_YEAR,
            max: MAX_YEAR,
        },

        duration: {
            type: Number,
            min: 1,
        },

        posterUrl: {
            type: String,
            trim: true,
        },

        overview: {
            type: String,
            trim: true,
            maxlength: 2000,
        },

        rating: {
            type: Number,
            min: 0,
            max: 10,
        },

        tmdbId: {
            type: Number,
            index: true,
        },

        adult: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

movieSchema.index(
    { tmdbId: 1 },
    {
        unique: true,
        sparse: true,
    }
);

export const MovieModel = model<Movie>('Movie', movieSchema);