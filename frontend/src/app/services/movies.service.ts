import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api-config';

export interface MovieCreateRequest {
  title: string;
  year?: number;
  duration?: number;
  posterUrl?: string;
  overview?: string;
  rating?: number;
}

export type MovieUpdateRequest = Partial<MovieCreateRequest>;

export interface Movie {
  _id: string;
  title: string;
  year?: number;
  duration?: number;
  posterUrl?: string;
  tmdbId?: number;
  overview?: string;
  rating?: number;
  adult?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class MoviesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_BASE_URL;

  getMovies() {
    return this.http.get<Movie[]>(`${this.baseUrl}/movies`);
  }

  createMovie(payload: MovieCreateRequest) {
    return this.http.post<Movie>(`${this.baseUrl}/movies`, payload);
  }

  updateMovie(id: string, payload: MovieUpdateRequest) {
    return this.http.patch<Movie>(`${this.baseUrl}/movies/${id}`, payload);
  }

  deleteMovie(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/movies/${id}`);
  }
}
