import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './movies.component.html',
})
export class MoviesComponent implements OnInit {
  movies: any[] = [];
  loading = false;
  error = '';

  title = '';
  year?: number;
  genresText = ''; // "Sci-Fi, Thriller"

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
    const genres = this.genresText
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    this.api.createMovie({ title: this.title, year: this.year, genres }).subscribe({
      next: () => {
        this.title = '';
        this.year = undefined;
        this.genresText = '';
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