import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api-config';
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
  private readonly baseUrl = API_BASE_URL;

  searchExternalMovies(query: string) {
    return this.http.get<ExternalMovie[]>(`${this.baseUrl}/tmdb/search`, {
      params: { q: query },
    });
  }

  importMovie(tmdbId: number) {
    return this.http.post<Movie>(`${this.baseUrl}/tmdb/import/${tmdbId}`, {});
  }
}
