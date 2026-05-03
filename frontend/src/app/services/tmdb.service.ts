import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_BASE_URL } from './api-config';
import { AuthService } from './auth.service';

export interface ExternalMovie {
  tmdbId: number;
  title: string;
  year?: number;
  overview?: string;
  rating?: number;
  posterUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = API_BASE_URL;

  searchExternalMovies(query: string) {
    return this.http.get<ExternalMovie[]>(
      `${this.baseUrl}/tmdb/search`,
      {
        params: { q: query },
        headers: this.getHeaders(),
      }
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.auth.token();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }
}
