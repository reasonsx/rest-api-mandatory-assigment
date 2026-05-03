export interface TmdbMovieResult {
    tmdbId: number;
    title: string;
    year?: number;
    overview?: string;
    rating?: number;
    posterUrl?: string;
}

export interface TmdbSearchResponse {
    results: {
        id: number;
        title: string;
        release_date?: string;
        overview?: string;
        vote_average?: number;
        poster_path?: string | null;
    }[];
}