import { Types } from "mongoose";

export const MIN_YEAR = 1878;
export const MAX_YEAR = new Date().getFullYear() + 1;

type MoviePayloadInput = {
    title?: unknown;
    year?: unknown;
    genres?: unknown;
    posterUrl?: unknown;
    tmdbId?: unknown;
    overview?: unknown;
    rating?: unknown;
};

export function isObjectId(id: unknown): id is string {
    return typeof id === "string" && Types.ObjectId.isValid(id);
}

export function isValidYear(year: unknown): year is number {
    return (
        typeof year === "number" &&
        Number.isInteger(year) &&
        year >= MIN_YEAR &&
        year <= MAX_YEAR
    );
}

function isValidRating(rating: unknown): rating is number {
    return (
        typeof rating === "number" &&
        Number.isFinite(rating) &&
        rating >= 0 &&
        rating <= 10
    );
}

export function cleanGenres(genres: unknown): string[] {
    if (!Array.isArray(genres) || !genres.every((g) => typeof g === "string")) {
        throw new Error("genres must be an array of strings");
    }

    return [...new Set(genres.map((g) => g.trim()).filter(Boolean))];
}

export function cleanMoviePayload(body: MoviePayloadInput, partial = false) {
    const payload: Record<string, unknown> = {};

    if (!partial || body.title !== undefined) {
        if (typeof body.title !== "string" || !body.title.trim()) {
            throw new Error("title must be a non-empty string");
        }

        payload.title = body.title.trim();
    }

    if (body.year !== undefined) {
        if (!isValidYear(body.year)) {
            throw new Error(`year must be an integer between ${MIN_YEAR} and ${MAX_YEAR}`);
        }

        payload.year = body.year;
    }

    if (body.genres !== undefined) {
        payload.genres = cleanGenres(body.genres);
    }

    if (body.posterUrl !== undefined) {
        if (typeof body.posterUrl !== "string") {
            throw new Error("posterUrl must be a string");
        }

        payload.posterUrl = body.posterUrl.trim();
    }

    if (body.tmdbId !== undefined) {
        if (typeof body.tmdbId !== "number" || !Number.isInteger(body.tmdbId)) {
            throw new Error("tmdbId must be an integer");
        }

        payload.tmdbId = body.tmdbId;
    }

    if (body.overview !== undefined) {
        if (typeof body.overview !== "string") {
            throw new Error("overview must be a string");
        }

        payload.overview = body.overview.trim();
    }

    if (body.rating !== undefined) {
        if (!isValidRating(body.rating)) {
            throw new Error("rating must be between 0 and 10");
        }

        payload.rating = body.rating;
    }

    return payload;
}