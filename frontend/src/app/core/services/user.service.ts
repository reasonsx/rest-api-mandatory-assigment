import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_BASE_URL } from './api-config';

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
  private readonly profileSig = signal<UserProfile | null>(null);

  readonly profile = computed(() => this.profileSig());

  getProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/users/${userId}`);
  }

  loadProfile(userId: string): Observable<UserProfile> {
    return this.getProfile(userId).pipe(tap((profile) => this.profileSig.set(profile)));
  }

  updateProfile(userId: string, data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http
      .patch<UserProfile>(`${this.baseUrl}/users/${userId}`, data)
      .pipe(tap((profile) => this.profileSig.set(profile)));
  }

  clearProfile(): void {
    this.profileSig.set(null);
  }
}
