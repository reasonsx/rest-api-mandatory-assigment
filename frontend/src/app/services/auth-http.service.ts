import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api-config';

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

@Injectable({ providedIn: 'root' })
export class AuthHttpService {
  private http = inject(HttpClient);
  private baseUrl = API_BASE_URL;

  register(payload: RegisterRequest) {
    return this.http.post(`${this.baseUrl}/auth/register`, payload);
  }

  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload);
  }
}
