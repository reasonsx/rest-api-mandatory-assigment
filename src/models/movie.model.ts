import { Schema, model } from "mongoose";
import { Movie } from "../interfaces/movie.interface";

const movieSchema = new Schema<Movie>(
  {
    title: { type: String, required: true },
    year: { type: Number },
    genres: [{ type: String }],
    posterUrl: { type: String },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

export const MovieModel = model<Movie>("Movie", movieSchema);