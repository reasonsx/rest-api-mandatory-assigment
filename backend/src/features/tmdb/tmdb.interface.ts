export interface TmdbMovie {
    id: number;
    title: string;
    release_date?: string;
    genre_ids?: number[];
    poster_path?: string | null;
    overview?: string;
    vote_average?: number;
}

export interface TmdbSearchResponse {
    results: TmdbMovie[];
}