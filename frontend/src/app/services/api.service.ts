import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {AuthService} from './auth.service';

const API_BASE_URL = 'https://movie-tracker-yre7.onrender.com/api';

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface MovieCreateRequest {
  title: string;
  year?: number;
  genres?: string[];
  posterUrl?: string;
}
export interface ExternalMovie {
  tmdbId: number;
  title: string;
  year?: number;
  overview?: string;
  rating?: number;
  posterUrl?: string;
}

export type MovieUpdateRequest = Partial<MovieCreateRequest>;
export type WatchStatus = 'planned' | 'watching' | 'watched';

export interface MovieLike {
  _id: string;
  title: string;
  year?: number;
  genres?: string[];
  posterUrl?: string;
  updatedAt?: string;
}

export interface UserMovieUpdateRequest {
  status?: WatchStatus;
  watchedAt?: string;
  rating?: number;
  review?: string;
}

export interface UserMovieLike {
  _id?: string;
  userId: string;
  movieId: string | MovieLike | null;
  status: WatchStatus;
  watchedAt?: string;
  rating?: number;
  review?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({providedIn: 'root'})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly baseUrl = API_BASE_URL;

  register(payload: RegisterRequest) {
    return this.http.post(`${this.baseUrl}/auth/register`, payload);
  }

  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload);
  }

  getMovies() {
    return this.http.get<MovieLike[]>(`${this.baseUrl}/movies`);
  }

  createMovie(payload: MovieCreateRequest) {
    return this.http.post<MovieLike>(`${this.baseUrl}/movies`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  updateMovie(id: string, payload: MovieUpdateRequest) {
    return this.http.patch<MovieLike>(`${this.baseUrl}/movies/${id}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteMovie(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/movies/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getUserMovies(userId: string) {
    return this.http.get<UserMovieLike[]>(`${this.baseUrl}/users/${userId}/movies`, {
      headers: this.getAuthHeaders(),
    });
  }

  addMovieToUser(userId: string, movieId: string) {
    return this.http.post<UserMovieLike>(
      `${this.baseUrl}/users/${userId}/movies`,
      {movieId},
      {headers: this.getAuthHeaders()}
    );
  }

  updateUserMovie(userMovieId: string, payload: UserMovieUpdateRequest) {
    return this.http.patch<UserMovieLike>(
      `${this.baseUrl}/users/movies/${userMovieId}`,
      payload,
      {headers: this.getAuthHeaders()}
    );
  }

  deleteUserMovie(userMovieId: string) {
    return this.http.delete<void>(`${this.baseUrl}/users/movies/${userMovieId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  searchExternalMovies(query: string) {
    return this.http.get<ExternalMovie[]>(
      `${this.baseUrl}/tmdb/search`,
      {
        params: { q: query },
        headers: this.getAuthHeaders(),
      }
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.token();

    return token
      ? new HttpHeaders({Authorization: `Bearer ${token}`})
      : new HttpHeaders();
  }
}
