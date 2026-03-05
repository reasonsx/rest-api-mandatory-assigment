import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from './auth.service';

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface MovieCreateRequest {
  title: string;
  year?: number;
  genres?: string[];
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
  movieId: string | MovieLike;
  status: WatchStatus;
  watchedAt?: string;
  rating?: number;
  review?: string;
}

@Injectable({providedIn: 'root'})
export class ApiService {
  private base = 'http://localhost:4000/api';

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  private authHeaders() {
    const token = this.auth.token();
    return token
      ? new HttpHeaders({Authorization: `Bearer ${token}`})
      : new HttpHeaders();
  }

  register(data: RegisterRequest) {
    return this.http.post(`${this.base}/auth/register`, data);
  }

  login(data: LoginRequest) {
    return this.http.post<{ token: string }>(`${this.base}/auth/login`, data);
  }

  getMovies() {
    return this.http.get<MovieLike[]>(`${this.base}/movies`);
  }

  createMovie(payload: MovieCreateRequest) {
    return this.http.post<MovieLike>(`${this.base}/movies`, payload, {headers: this.authHeaders()});
  }

  updateMovie(id: string, payload: MovieUpdateRequest) {
    return this.http.patch<MovieLike>(`${this.base}/movies/${id}`, payload, {headers: this.authHeaders()});
  }

  deleteMovie(id: string) {
    return this.http.delete<void>(`${this.base}/movies/${id}`, {headers: this.authHeaders()});
  }

  getUserMovies(userId: string) {
    return this.http.get<UserMovieLike[]>(`${this.base}/users/${userId}/movies`, {headers: this.authHeaders()});
  }

  addMovieToUser(userId: string, movieId: string) {
    return this.http.post<UserMovieLike>(
      `${this.base}/users/${userId}/movies`,
      {movieId},
      {headers: this.authHeaders()}
    );
  }

  updateUserMovie(userMovieId: string, patch: UserMovieUpdateRequest) {
    return this.http.patch<UserMovieLike>(`${this.base}/users/movies/${userMovieId}`, patch, { headers: this.authHeaders() });
  }

  deleteUserMovie(userMovieId: string) {
    return this.http.delete<void>(`${this.base}/users/movies/${userMovieId}`, {headers: this.authHeaders()});
  }
}
