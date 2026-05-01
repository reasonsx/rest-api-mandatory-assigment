export interface Movie {
    _id?: string;
    title: string;
    year?: number;
    genres?: string[];
    posterUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}