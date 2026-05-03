import { TmdbMovieResult, TmdbSearchResponse } from "./tmdb.interface";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export async function searchTmdbMovies(query: string): Promise<TmdbMovieResult[]> {
    const token = process.env.TMDB_ACCESS_TOKEN;

    if (!token) {
        throw new Error("TMDB_ACCESS_TOKEN is missing");
    }

    const url = new URL(`${TMDB_BASE_URL}/search/movie`);

    url.search = new URLSearchParams({
        query,
        include_adult: "false",
        language: "en-US",
        page: "1",
    }).toString();

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`TMDB request failed with status ${response.status}`);
    }

    const data = (await response.json()) as TmdbSearchResponse;

    return data.results.map((movie) => ({
        tmdbId: movie.id,
        title: movie.title,
        year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : undefined,
        overview: movie.overview,
        rating: movie.vote_average,
        posterUrl: movie.poster_path
            ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
            : undefined,
    }));
}