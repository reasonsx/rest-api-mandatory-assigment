import { Schema, model } from "mongoose";
import { Movie } from "./movie.interface";

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

        genres: {
            type: [String],
            default: [],
        },

        posterUrl: {
            type: String,
            trim: true,
        },

        // 🔹 NEW FIELDS
        tmdbId: {
            type: Number,
            index: true,
        },

        overview: {
            type: String,
            trim: true,
        },

        rating: {
            type: Number,
            min: 0,
            max: 10,
        },
    },
    {
        timestamps: true,
    }
);

// ✅ Prevent duplicate TMDB imports
movieSchema.index(
    { tmdbId: 1 },
    {
        unique: true,
        sparse: true, // allows multiple docs without tmdbId
    }
);

export const MovieModel = model<Movie>("Movie", movieSchema);