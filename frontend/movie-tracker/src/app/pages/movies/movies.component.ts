import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

type GenreOption = { label: string; value: string };

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    InputTextModule,
    InputNumberModule,
    MultiSelectModule,
    ButtonModule,
  ],
  templateUrl: './movies.component.html',
})
export class MoviesComponent implements OnInit {
  movies: any[] = [];
  loading = false;
  error = '';

  // form
  title = '';
  year?: number;
  posterUrl = '';
  selectedGenres: string[] = [];

  // dropdown options (adjust to what you want)
  genreOptions: GenreOption[] = [
    { label: 'Action', value: 'Action' },
    { label: 'Adventure', value: 'Adventure' },
    { label: 'Comedy', value: 'Comedy' },
    { label: 'Drama', value: 'Drama' },
    { label: 'Fantasy', value: 'Fantasy' },
    { label: 'Horror', value: 'Horror' },
    { label: 'Romance', value: 'Romance' },
    { label: 'Sci-Fi', value: 'Sci-Fi' },
    { label: 'Thriller', value: 'Thriller' },
  ];

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.api.getMovies().subscribe({
      next: (data) => {
        this.movies = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load movies';
        this.loading = false;
      },
    });
  }

  create() {
    this.error = '';

    const payload = {
      title: this.title,
      year: this.year,
      genres: this.selectedGenres,
      posterUrl: this.posterUrl || undefined,
    };

    this.api.createMovie(payload).subscribe({
      next: () => {
        this.title = '';
        this.year = undefined;
        this.posterUrl = '';
        this.selectedGenres = [];
        this.load();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to create movie';
      },
    });
  }

  logout() {
    this.auth.logout();
  }
}