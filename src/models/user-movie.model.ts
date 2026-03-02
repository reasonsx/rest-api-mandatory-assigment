import { Schema, model } from "mongoose";
import { UserMovie } from "../interfaces/user-movie.interface";

const userMovieSchema = new Schema<UserMovie>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },

    status: {
      type: String,
      enum: ["planned", "watching", "watched"],
      default: "planned",
      required: true,
    },

    watchedAt: { type: Date },
    rating: { type: Number, min: 1, max: 10 },
    review: { type: String, maxlength: 2000 },
  },
  { timestamps: true }
);

export const UserMovieModel = model<UserMovie>("UserMovie", userMovieSchema);