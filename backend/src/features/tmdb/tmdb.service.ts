const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface TmdbSearchResponse {
    results: {
        id: number;
        title: string;
        release_date?: string;
        overview?: string;
        vote_average?: number;
        poster_path?: string | null;
    }[];
}

export async function searchTmdbMovies(query: string) {
    const token = process.env.TMDB_ACCESS_TOKEN;

    if (!token) {
        throw new Error('TMDB_ACCESS_TOKEN is missing');
    }

    const url = new URL(`${TMDB_BASE_URL}/search/movie`);
    url.searchParams.set('query', query);
    url.searchParams.set('include_adult', 'false');
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('page', '1');

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch TMDB movies');
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