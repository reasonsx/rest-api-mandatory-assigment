import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { PrimeIcons } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { Movie, MovieCreateRequest, MoviesService } from '../../core/services/movies.service';
import { ExternalMovie, TmdbService } from '../../core/services/tmdb.service';

type AdminTab = 'tmdb' | 'manual';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    NavbarComponent,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TooltipModule,
  ],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly moviesService = inject(MoviesService);
  private readonly tmdbService = inject(TmdbService);
  private readonly router = inject(Router);

  readonly PrimeIcons = PrimeIcons;

  readonly activeTab = signal<AdminTab>('tmdb');
  readonly movies = signal<Movie[]>([]);
  readonly loadingMovies = signal(false);

  readonly externalSearch = signal('');
  readonly externalLoading = signal(false);
  readonly externalError = signal('');
  readonly externalMovies = signal<ExternalMovie[]>([]);
  readonly importingTmdbId = signal<number | null>(null);

  readonly creatingMovie = signal(false);
  readonly manualError = signal('');
  readonly manualSuccess = signal('');

  readonly importedCount = computed(() => this.movies().filter((movie) => movie.tmdbId).length);

  readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    year: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    duration: new FormControl<number | null>(null),
    rating: new FormControl<number | null>(null),
    posterUrl: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    overview: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (!this.auth.isAdmin()) {
      this.router.navigateByUrl('/');
      return;
    }

    this.loadMovies();
  }

  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }

  searchExternalMovies(): void {
    const query = this.externalSearch().trim();

    if (!query) {
      this.externalError.set('Search query is required.');
      return;
    }

    this.externalLoading.set(true);
    this.externalError.set('');

    this.tmdbService.searchExternalMovies(query).subscribe({
      next: (movies) => {
        this.externalMovies.set(movies ?? []);
        this.externalLoading.set(false);
      },
      error: (err) => {
        this.externalError.set(err?.error?.message ?? 'Failed to search TMDB');
        this.externalLoading.set(false);
      },
    });
  }

  importExternalMovie(movie: ExternalMovie): void {
    if (this.isAlreadyImported(movie)) {
      this.externalError.set('This movie is already imported.');
      return;
    }

    this.importingTmdbId.set(movie.tmdbId);
    this.externalError.set('');

    this.tmdbService.importMovie(movie.tmdbId).subscribe({
      next: () => {
        this.importingTmdbId.set(null);
        this.loadMovies();
      },
      error: (err) => {
        this.externalError.set(err?.error?.message ?? 'Failed to import movie');
        this.importingTmdbId.set(null);
      },
    });
  }

  createMovie(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.creatingMovie.set(true);
    this.manualError.set('');
    this.manualSuccess.set('');

    this.moviesService.createMovie(this.buildMoviePayload(this.form.getRawValue())).subscribe({
      next: () => {
        this.form.reset({
          title: '',
          year: null,
          duration: null,
          rating: null,
          posterUrl: '',
          overview: '',
        });

        this.manualSuccess.set('Movie created.');
        this.creatingMovie.set(false);
        this.loadMovies();
      },
      error: (err) => {
        this.manualError.set(err?.error?.message ?? 'Failed to create movie');
        this.creatingMovie.set(false);
      },
    });
  }

  isAlreadyImported(movie: ExternalMovie): boolean {
    return this.movies().some((item) => {
      if (item.tmdbId && item.tmdbId === movie.tmdbId) {
        return true;
      }

      return (
        item.title.trim().toLowerCase() === movie.title.trim().toLowerCase() &&
        item.year === movie.year
      );
    });
  }

  private loadMovies(): void {
    this.loadingMovies.set(true);

    this.moviesService.getMovies().subscribe({
      next: (movies) => {
        this.movies.set(movies ?? []);
        this.loadingMovies.set(false);
      },
      error: () => {
        this.loadingMovies.set(false);
      },
    });
  }

  private buildMoviePayload(value: {
    title: string;
    year: number | null;
    duration: number | null;
    rating: number | null;
    posterUrl: string;
    overview: string;
  }): MovieCreateRequest {
    return {
      title: value.title.trim(),
      year: value.year ?? undefined,
      duration: value.duration ?? undefined,
      rating: value.rating ?? undefined,
      posterUrl: value.posterUrl.trim() || undefined,
      overview: value.overview.trim() || undefined,
    };
  }
}
