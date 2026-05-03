import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_BASE_URL } from './api-config';
import { AuthService } from './auth.service';

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
  private readonly auth = inject(AuthService);
  private readonly baseUrl = API_BASE_URL;

  getMovies() {
    return this.http.get<Movie[]>(`${this.baseUrl}/movies`);
  }

  createMovie(payload: MovieCreateRequest) {
    return this.http.post<Movie>(`${this.baseUrl}/movies`, payload, {
      headers: this.getHeaders(),
    });
  }

  updateMovie(id: string, payload: MovieUpdateRequest) {
    return this.http.patch<Movie>(`${this.baseUrl}/movies/${id}`, payload, {
      headers: this.getHeaders(),
    });
  }

  deleteMovie(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/movies/${id}`, {
      headers: this.getHeaders(),
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.auth.token();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
