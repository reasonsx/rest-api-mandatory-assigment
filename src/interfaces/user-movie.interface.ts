import type {Types} from "mongoose";

export type WatchStatus = "planned" | "watching" | "watched";

export interface UserMovie {
    userId: Types.ObjectId;
    movieId: Types.ObjectId;

    status: WatchStatus;
    watchedAt?: Date;

    rating?: number;
    review?: string;

    createdAt?: Date;
    updatedAt?: Date;
}