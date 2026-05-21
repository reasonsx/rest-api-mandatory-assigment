import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {API_BASE_URL} from './api-config';

export interface UserProfile {
  _id: string;
  email: string;
  username: string;
  profileImageUrl?: string;
  role: 'user' | 'admin';
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_BASE_URL;

  getProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/users/${userId}`);
  }

  updateProfile(userId: string, data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.baseUrl}/users/${userId}`, data);
  }
}
