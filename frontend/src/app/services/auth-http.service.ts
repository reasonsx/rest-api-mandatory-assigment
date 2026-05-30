import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api-config';
import type { AuthSession } from './auth.service';

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginResponse = AuthSession;

@Injectable({ providedIn: 'root' })
export class AuthHttpService {
  private http = inject(HttpClient);
  private baseUrl = API_BASE_URL;

  register(payload: RegisterRequest) {
    return this.http.post(`${this.baseUrl}/auth/register`, payload);
  }

  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload, {
      withCredentials: true,
    });
  }

  me() {
    return this.http.get<AuthSession>(`${this.baseUrl}/auth/me`, {
      withCredentials: true,
    });
  }

  logout() {
    return this.http.post<void>(
      `${this.baseUrl}/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    );
  }
}
