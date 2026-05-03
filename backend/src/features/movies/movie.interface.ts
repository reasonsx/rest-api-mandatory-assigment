export interface Movie {
    _id?: string;
    title: string;
    year?: number;
    genres: string[];
    posterUrl?: string;

    // NEW
    tmdbId?: number;
    overview?: string;
    rating?: number;

    createdAt?: Date;
    updatedAt?: Date;
}