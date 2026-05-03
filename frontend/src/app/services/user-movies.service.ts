import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_BASE_URL } from './api-config';
import { AuthService } from './auth.service';
import { Movie } from './movies.service';

export type WatchStatus = 'planned' | 'watching' | 'watched';

export interface UserMovieUpdateRequest {
  status?: WatchStatus;
  watchedAt?: string;
  rating?: number;
  review?: string;
}

export interface UserMovie {
  _id?: string;
  userId: string;
  movieId: string | Movie | null;
  status: WatchStatus;
  watchedAt?: string;
  rating?: number;
  review?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class UserMoviesService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = API_BASE_URL;

  getUserMovies(userId: string) {
    return this.http.get<UserMovie[]>(`${this.baseUrl}/users/${userId}/movies`, {
      headers: this.getHeaders(),
    });
  }

  addMovieToUser(userId: string, movieId: string) {
    return this.http.post<UserMovie>(
      `${this.baseUrl}/users/${userId}/movies`,
      { movieId },
      { headers: this.getHeaders() }
    );
  }

  updateUserMovie(userMovieId: string, payload: UserMovieUpdateRequest) {
    return this.http.patch<UserMovie>(
      `${this.baseUrl}/users/movies/${userMovieId}`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  deleteUserMovie(userMovieId: string) {
    return this.http.delete<void>(`${this.baseUrl}/users/movies/${userMovieId}`, {
      headers: this.getHeaders(),
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.auth.token();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
