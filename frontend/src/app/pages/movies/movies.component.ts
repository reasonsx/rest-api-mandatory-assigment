import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, PrimeIcons } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from '../../services/auth.service';
import {MovieCreateRequest, Movie , MoviesService, MovieUpdateRequest} from '../../services/movies.service';
import {
  UserMovie,
  UserMoviesService,
  UserMovieUpdateRequest,
  WatchStatus
} from '../../services/user-movies.service';
import {ExternalMovie, TmdbService} from '../../services/tmdb.service';

interface Option<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    PaginatorModule,
    DialogModule,
    TooltipModule,
    SelectModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './movies.component.html',
})
export class MoviesComponent implements OnInit {
  private readonly moviesService = inject(MoviesService);
  private readonly userMoviesService = inject(UserMoviesService);
  private readonly tmdbService = inject(TmdbService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);

  readonly auth = inject(AuthService);
  readonly PrimeIcons = PrimeIcons;

  readonly movies = signal<Movie[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly creatingMovie = signal(false);
  readonly editing = signal(false);

  readonly search = signal('');
  readonly rows = signal(6);
  readonly first = signal(0);

  readonly editOpen = signal(false);
  readonly editTarget = signal<Movie | null>(null);

  readonly myMovies = signal<UserMovie[]>([]);
  readonly myError = signal('');

  readonly externalSearch = signal('');
  readonly externalLoading = signal(false);
  readonly externalError = signal('');
  readonly externalMovies = signal<ExternalMovie[]>([]);
  readonly importingTmdbId = signal<number | null>(null);

  readonly statusOptions: Option<WatchStatus>[] = [
    { label: 'Planned', value: 'planned' },
    { label: 'Watching', value: 'watching' },
    { label: 'Watched', value: 'watched' },
  ];

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

  readonly editForm = new FormGroup({
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

  readonly filteredMovies = computed(() => {
    const query = this.search().trim().toLowerCase();

    if (!query) return this.movies();

    return this.movies().filter((movie) => {
      const title = movie.title.toLowerCase();
      const year = String(movie.year ?? '');

      return title.includes(query) || year.includes(query);
    });
  });

  readonly pagedMovies = computed(() => {
    const start = this.first();
    return this.filteredMovies().slice(start, start + this.rows());
  });

  readonly showPaginator = computed(() => this.filteredMovies().length > this.rows());

  readonly myIndex = computed(() => {
    const map = new Map<string, UserMovie>();

    for (const item of this.myMovies()) {
      const movieId = this.getMovieId(item);

      if (movieId) {
        map.set(movieId, item);
      }
    }

    return map;
  });

  ngOnInit(): void {
    this.loadMovies();
    this.loadMyListIfLoggedIn();
  }

  goLogin(): void {
    this.router.navigateByUrl('/login');
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.first.set(0);
  }

  onPageChange(event: PaginatorState): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? this.rows());
  }

  loadMovies(): void {
    this.loading.set(true);
    this.error.set('');

    this.moviesService.getMovies().subscribe({
      next: (movies) => {
        this.movies.set(movies ?? []);
        this.first.set(0);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load movies');
        this.loading.set(false);
      },
    });
  }

  createMovie(): void {
    if (!this.auth.isAdmin()) {
      this.error.set('Admin only.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.creatingMovie.set(true);
    this.error.set('');

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

        this.creatingMovie.set(false);
        this.loadMovies();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to create movie');
        this.creatingMovie.set(false);
      },
    });
  }

  openEdit(movie: Movie): void {
    if (!this.auth.isAdmin()) return;

    this.editTarget.set(movie);
    this.editForm.reset({
      title: movie.title,
      year: movie.year ?? null,
      duration: movie.duration ?? null,
      rating: movie.rating ?? null,
      posterUrl: movie.posterUrl ?? '',
      overview: movie.overview ?? '',
    });

    this.editOpen.set(true);
  }

  closeEdit(): void {
    this.editOpen.set(false);
    this.editTarget.set(null);
  }

  saveEdit(): void {
    const movie = this.editTarget();

    if (!this.auth.isAdmin() || !movie?._id) return;

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.editing.set(true);

    const payload: MovieUpdateRequest = this.buildMoviePayload(this.editForm.getRawValue());

    this.moviesService.updateMovie(movie._id, payload).subscribe({
      next: () => {
        this.editing.set(false);
        this.closeEdit();
        this.loadMovies();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to update movie');
        this.editing.set(false);
      },
    });
  }

  deleteMovie(movie: Movie): void {
    if (!this.auth.isAdmin() || !movie._id) return;

    this.confirmationService.confirm({
      header: 'Confirm delete',
      message: `Delete "${movie.title}"? This cannot be undone.`,
      icon: PrimeIcons.EXCLAMATION_TRIANGLE,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.moviesService.deleteMovie(movie._id).subscribe({
          next: () => this.loadMovies(),
          error: (err) => {
            this.error.set(err?.error?.message ?? 'Failed to delete movie');
          },
        });
      },
    });
  }

  loadMyListIfLoggedIn(): void {
    if (!this.auth.isLoggedIn()) return;

    const userId = this.auth.userId();
    if (!userId) return;

    this.myError.set('');

    this.userMoviesService.getUserMovies(userId).subscribe({
      next: (movies) => {
        this.myMovies.set(movies ?? []);
      },
      error: (err) => {
        this.myError.set(err?.error?.message ?? 'Failed to load your list');
      },
    });
  }

  addToMyList(movieId: string): void {
    if (!this.auth.isLoggedIn()) {
      this.goLogin();
      return;
    }

    const userId = this.auth.userId();
    if (!userId) return;

    this.userMoviesService.addMovieToUser(userId, movieId).subscribe({
      next: () => this.loadMyListIfLoggedIn(),
      error: (err) => {
        this.myError.set(err?.error?.message ?? 'Failed to add to your list');
      },
    });
  }

  changeStatus(movieId: string, status: WatchStatus): void {
    const userMovie = this.myIndex().get(movieId);

    if (!userMovie?._id) return;

    const payload: UserMovieUpdateRequest = {
      status,
      watchedAt: status === 'watched' ? new Date().toISOString() : undefined,
    };

    this.userMoviesService.updateUserMovie(userMovie._id, payload).subscribe({
      next: () => this.loadMyListIfLoggedIn(),
      error: (err) => {
        this.myError.set(err?.error?.message ?? 'Failed to update status');
      },
    });
  }

  removeFromMyList(movieId: string): void {
    const userMovie = this.myIndex().get(movieId);

    if (!userMovie?._id) return;

    this.userMoviesService.deleteUserMovie(userMovie._id).subscribe({
      next: () => this.loadMyListIfLoggedIn(),
      error: (err) => {
        this.myError.set(err?.error?.message ?? 'Failed to remove from your list');
      },
    });
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
    if (!this.auth.isAdmin()) {
      this.externalError.set('Admin only.');
      return;
    }

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

  private getMovieId(item: UserMovie): string {
    if (typeof item.movieId === 'string') {
      return item.movieId;
    }

    return item.movieId?._id ?? '';
  }
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (!hours) return `${mins}m`;
    if (!mins) return `${hours}h`;

    return `${hours}h ${mins}m`;
  }
}
