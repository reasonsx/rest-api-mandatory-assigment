import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest) {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  login(data: LoginRequest) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/auth/login`, data);
  }

  getMovies() {
    return this.http.get<any[]>(`${this.baseUrl}/movies`);
  }

  createMovie(data: MovieCreateRequest) {
    return this.http.post(`${this.baseUrl}/movies`, data);
  }
}