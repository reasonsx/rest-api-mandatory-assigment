import {
    TmdbMovieDetailsResponse,
    TmdbMovieResult,
    TmdbSearchResponse,
} from './tmdb.interface';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function getToken(): string {
    const token = process.env.TMDB_ACCESS_TOKEN;

    if (!token) {
        throw new Error('TMDB_ACCESS_TOKEN is missing');
    }

    return token;
}

function posterUrl(path?: string | null): string | undefined {
    return path ? `${TMDB_IMAGE_BASE_URL}${path}` : undefined;
}

function yearFromDate(date?: string): number | undefined {
    return date ? Number(date.slice(0, 4)) : undefined;
}

async function tmdbGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${path}`);

    url.search = new URLSearchParams({
        language: 'en-US',
        ...params,
    }).toString();

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
            accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`TMDB request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
}

export async function searchTmdbMovies(query: string): Promise<TmdbMovieResult[]> {
    const data = await tmdbGet<TmdbSearchResponse>('/search/movie', {
        query,
        include_adult: 'false',
        page: '1',
    });

    return data.results
        .filter((movie) => !movie.adult)
        .map((movie) => ({
            tmdbId: movie.id,
            title: movie.title,
            year: yearFromDate(movie.release_date),
            overview: movie.overview,
            rating: movie.vote_average,
            posterUrl: posterUrl(movie.poster_path),
        }));
}

export async function getTmdbMovieDetails(tmdbId: number) {
    const movie = await tmdbGet<TmdbMovieDetailsResponse>(`/movie/${tmdbId}`);

    if (movie.adult) {
        throw new Error('Adult movies are not allowed');
    }

    return {
        tmdbId: movie.id,
        title: movie.title,
        year: yearFromDate(movie.release_date),
        duration: movie.runtime,
        overview: movie.overview,
        rating: movie.vote_average,
        posterUrl: posterUrl(movie.poster_path),
        adult: false,
    };
}