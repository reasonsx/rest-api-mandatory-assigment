import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_BASE_URL } from './api-config';
import { AuthService } from './auth.service';
import { Movie } from './movies.service';

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
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = API_BASE_URL;

  searchExternalMovies(query: string) {
    return this.http.get<ExternalMovie[]>(`${this.baseUrl}/tmdb/search`, {
      params: { q: query },
      headers: this.getHeaders(),
    });
  }

  importMovie(tmdbId: number) {
    return this.http.post<Movie>(
      `${this.baseUrl}/tmdb/import/${tmdbId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.auth.token();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
