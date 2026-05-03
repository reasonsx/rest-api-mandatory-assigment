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
        adult: boolean;
        title: string;
        release_date?: string;
        overview?: string;
        vote_average?: number;
        poster_path?: string | null;
    }[];
}

export interface TmdbMovieDetailsResponse {
    id: number;
    adult: boolean;
    title: string;
    release_date?: string;
    runtime?: number;
    overview?: string;
    vote_average?: number;
    poster_path?: string | null;
}