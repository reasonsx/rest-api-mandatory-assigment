import Joi from "joi";
import { Types } from "mongoose";

import { validateBody } from "../../shared/joi-validation";
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from "../../shared/validation-messages";

export const MIN_YEAR = 1878;
export const MAX_YEAR = new Date().getFullYear() + 1;

type MoviePayloadInput = {
    title?: string;
    year?: number;
    duration?: number;
    posterUrl?: string;
    tmdbId?: number;
    overview?: string;
    rating?: number;
    adult?: boolean;
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

const moviePayloadSchema = Joi.object<MoviePayloadInput>({
    title: Joi.string()
        .required()
        .trim()
        .min(1)
        .max(VALIDATION_LIMITS.movieTitleMaxLength)
        .messages({
            "any.required": VALIDATION_MESSAGES.movieTitleRequired,
            "string.base": VALIDATION_MESSAGES.movieTitleRequired,
            "string.empty": VALIDATION_MESSAGES.movieTitleRequired,
            "string.max": VALIDATION_MESSAGES.movieTitleMaxLength,
        }),
    year: Joi.number()
        .integer()
        .min(MIN_YEAR)
        .max(MAX_YEAR)
        .optional()
        .messages({
            "number.base": VALIDATION_MESSAGES.movieYearInvalid,
            "number.integer": VALIDATION_MESSAGES.movieYearInvalid,
            "number.min": VALIDATION_MESSAGES.movieYearInvalid,
            "number.max": VALIDATION_MESSAGES.movieYearInvalid,
        }),
    duration: Joi.number()
        .integer()
        .min(1)
        .optional()
        .messages({
            "number.base": VALIDATION_MESSAGES.movieDurationInvalid,
            "number.integer": VALIDATION_MESSAGES.movieDurationInvalid,
            "number.min": VALIDATION_MESSAGES.movieDurationInvalid,
        }),
    posterUrl: Joi.string()
        .trim()
        .allow("")
        .max(VALIDATION_LIMITS.urlMaxLength)
        .uri({ scheme: ["http", "https"] })
        .optional()
        .messages({
            "string.base": VALIDATION_MESSAGES.moviePosterUrlInvalid,
            "string.empty": VALIDATION_MESSAGES.moviePosterUrlInvalid,
            "string.max": VALIDATION_MESSAGES.urlMaxLength,
            "string.uri": VALIDATION_MESSAGES.moviePosterUrlInvalid,
        }),
    tmdbId: Joi.number()
        .integer()
        .optional()
        .messages({
            "number.base": "TMDB id must be a whole number.",
            "number.integer": "TMDB id must be a whole number.",
        }),
    overview: Joi.string()
        .trim()
        .allow("")
        .max(VALIDATION_LIMITS.movieOverviewMaxLength)
        .optional()
        .messages({
            "string.base": "Overview must be text.",
            "string.max": VALIDATION_MESSAGES.movieOverviewMaxLength,
        }),
    rating: Joi.number()
        .min(0)
        .max(10)
        .optional()
        .messages({
            "number.base": VALIDATION_MESSAGES.movieRatingInvalid,
            "number.min": VALIDATION_MESSAGES.movieRatingInvalid,
            "number.max": VALIDATION_MESSAGES.movieRatingInvalid,
        }),
    adult: Joi.boolean()
        .valid(false)
        .optional()
        .messages({
            "any.only": VALIDATION_MESSAGES.adultMoviesBlocked,
            "boolean.base": VALIDATION_MESSAGES.adultMoviesBlocked,
        }),
});

export function cleanMoviePayload(body: unknown, partial = false): MoviePayloadInput {
    const schema = partial
        ? moviePayloadSchema.fork(["title"], (title) => title.optional()).min(1).messages({
              "object.min": VALIDATION_MESSAGES.noUpdateFields,
          })
        : moviePayloadSchema;

    return validateBody<MoviePayloadInput>(schema, body);
}
