export type WatchStatus = "planned" | "watching" | "watched";

export interface UserMovie {
  _id?: string;
  userId: string;
  movieId: string;

  status: WatchStatus;
  watchedAt?: Date;

  rating?: number;
  review?: string;

  createdAt?: Date;
  updatedAt?: Date;
}