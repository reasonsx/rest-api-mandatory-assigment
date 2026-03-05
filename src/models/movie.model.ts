import {Schema, model} from "mongoose";
import {Movie} from "../interfaces/movie.interface";

const movieSchema = new Schema<Movie>(
    {
        title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
        genres: [{ type: String, trim: true }],
        posterUrl: { type: String, trim: true },
        year: { type: Number, min: 1878, max: new Date().getFullYear() + 1 }, // +1 in case a movie is supposed to be released next year
    },
    {
        timestamps: true, // createdAt & updatedAt (they are auto added by Mongoose)
    }
);

export const MovieModel = model<Movie>("Movie", movieSchema);