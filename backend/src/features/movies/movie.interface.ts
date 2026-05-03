export interface Movie {
    _id?: string;

    title: string;
    year?: number;
    duration?: number;

    overview?: string;
    rating?: number;
    posterUrl?: string;

    tmdbId?: number;
    adult?: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}