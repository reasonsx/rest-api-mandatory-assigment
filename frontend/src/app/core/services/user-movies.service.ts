import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api-config';
import { Movie } from './movies.service';

export type WatchStatus = 'planned' | 'watched';

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
  private readonly baseUrl = API_BASE_URL;

  getUserMovies(userId: string) {
    return this.http.get<UserMovie[]>(`${this.baseUrl}/users/${userId}/movies`);
  }

  addMovieToUser(userId: string, movieId: string, status: WatchStatus = 'planned') {
    return this.http.post<UserMovie>(
      `${this.baseUrl}/users/${userId}/movies`,
      { movieId, status }
    );
  }

  updateUserMovie(userMovieId: string, payload: UserMovieUpdateRequest) {
    return this.http.patch<UserMovie>(
      `${this.baseUrl}/users/movies/${userMovieId}`,
      payload
    );
  }

  deleteUserMovie(userMovieId: string) {
    return this.http.delete<void>(`${this.baseUrl}/users/movies/${userMovieId}`);
  }
}
