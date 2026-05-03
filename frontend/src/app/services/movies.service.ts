import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_BASE_URL } from './api-config';
import { AuthService } from './auth.service';

export interface MovieCreateRequest {
  title: string;
  year?: number;
  genres?: string[];
  posterUrl?: string;
  tmdbId?: number;
  overview?: string;
  rating?: number;
}

export type MovieUpdateRequest = Partial<MovieCreateRequest>;

export interface MovieLike {
  _id: string;
  title: string;
  year?: number;
  genres?: string[];
  posterUrl?: string;
  tmdbId?: number;
  overview?: string;
  rating?: number;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class MoviesService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = API_BASE_URL;

  getMovies() {
    return this.http.get<MovieLike[]>(`${this.baseUrl}/movies`);
  }

  createMovie(payload: MovieCreateRequest) {
    return this.http.post<MovieLike>(`${this.baseUrl}/movies`, payload, {
      headers: this.getHeaders(),
    });
  }

  updateMovie(id: string, payload: MovieUpdateRequest) {
    return this.http.patch<MovieLike>(`${this.baseUrl}/movies/${id}`, payload, {
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
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }
}
