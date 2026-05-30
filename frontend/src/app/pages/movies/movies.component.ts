import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, PrimeIcons } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DecimalPipe } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { Movie, MoviesService, MovieUpdateRequest } from '../../core/services/movies.service';
import {
  UserMovie,
  UserMoviesService,
  UserMovieUpdateRequest,
  WatchStatus,
} from '../../core/services/user-movies.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { applyApiFieldErrors, apiErrorMessage, clearApiFieldErrors } from '../../core/services/api-error';
import {
  optionalHttpUrl,
  validationMessage,
  VALIDATION_LIMITS,
} from '../../core/validation/validation-messages';

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
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    DecimalPipe,
  ],
  providers: [ConfirmationService],
  templateUrl: './movies.component.html',
})
export class MoviesComponent implements OnInit {
  private readonly moviesService = inject(MoviesService);
  private readonly userMoviesService = inject(UserMoviesService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);

  readonly auth = inject(AuthService);
  readonly PrimeIcons = PrimeIcons;

  readonly movies = signal<Movie[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly editing = signal(false);

  readonly search = signal('');
  readonly rows = signal(10);
  readonly first = signal(0);

  readonly editOpen = signal(false);
  readonly editTarget = signal<Movie | null>(null);

  readonly detailsOpen = signal(false);
  readonly selectedMovie = signal<Movie | null>(null);

  readonly userMovies = signal<UserMovie[]>([]);
  readonly userMoviesError = signal('');
  readonly minMovieYear = 1878;
  readonly maxMovieYear = new Date().getFullYear() + 1;

  readonly editForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(VALIDATION_LIMITS.movieTitleMaxLength),
      ],
    }),
    year: new FormControl<number | null>(null, {
      validators: [
        Validators.min(this.minMovieYear),
        Validators.max(this.maxMovieYear),
      ],
    }),
    duration: new FormControl<number | null>(null, {
      validators: [Validators.min(1)],
    }),
    rating: new FormControl<number | null>(null, {
      validators: [Validators.min(0), Validators.max(10)],
    }),
    posterUrl: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.maxLength(VALIDATION_LIMITS.urlMaxLength),
        optionalHttpUrl(),
      ],
    }),
    overview: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(VALIDATION_LIMITS.movieOverviewMaxLength)],
    }),
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

  readonly userMovieByMovieId = computed(() => {
    const map = new Map<string, UserMovie>();

    for (const item of this.userMovies()) {
      const movieId = this.getMovieId(item);

      if (movieId) {
        map.set(movieId, item);
      }
    }

    return map;
  });

  ngOnInit(): void {
    this.loadMovies();
    this.loadUserMoviesIfLoggedIn();
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
        this.error.set(apiErrorMessage(err, 'Failed to load movies.'));
        this.loading.set(false);
      },
    });
  }

  openDetails(movie: Movie): void {
    this.selectedMovie.set(movie);
    this.detailsOpen.set(true);
  }

  closeDetails(): void {
    this.detailsOpen.set(false);
    this.selectedMovie.set(null);
  }

  openEdit(movie: Movie, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

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
    clearApiFieldErrors(this.editForm);

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
        applyApiFieldErrors(this.editForm, err);
        this.error.set(apiErrorMessage(err, 'Failed to update movie.'));
        this.editing.set(false);
      },
    });
  }

  deleteMovie(movie: Movie, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

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
            this.error.set(apiErrorMessage(err, 'Failed to delete movie.'));
          },
        });
      },
    });
  }

  loadUserMoviesIfLoggedIn(): void {
    if (!this.auth.isLoggedIn()) return;

    const userId = this.auth.userId();
    if (!userId) return;

    this.userMoviesError.set('');

    this.userMoviesService.getUserMovies(userId).subscribe({
      next: (movies) => {
        this.userMovies.set(movies ?? []);
      },
      error: (err) => {
        this.userMoviesError.set(apiErrorMessage(err, 'Failed to load your list.'));
      },
    });
  }

  addToUserMovies(movieId: string, status: WatchStatus, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!this.auth.isLoggedIn()) {
      this.goLogin();
      return;
    }

    const userId = this.auth.userId();
    if (!userId) return;

    this.userMoviesService.addMovieToUser(userId, movieId, status).subscribe({
      next: () => this.loadUserMoviesIfLoggedIn(),
      error: (err) => {
        this.userMoviesError.set(apiErrorMessage(err, 'Failed to add to your list.'));
      },
    });
  }

  changeStatus(movieId: string, status: WatchStatus): void {
    const userMovie = this.userMovieByMovieId().get(movieId);

    if (!userMovie?._id) return;

    this.updateUserMovieStatus(userMovie._id, status);
  }

  private updateUserMovieStatus(userMovieId: string, status: WatchStatus): void {
    const payload: UserMovieUpdateRequest = {
      status,
      watchedAt: status === 'watched' ? new Date().toISOString() : undefined,
    };

    this.userMoviesService.updateUserMovie(userMovieId, payload).subscribe({
      next: () => this.loadUserMoviesIfLoggedIn(),
      error: (err) => {
        this.userMoviesError.set(apiErrorMessage(err, 'Failed to update status.'));
      },
    });
  }

  removeFromUserMovies(movieId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const userMovie = this.userMovieByMovieId().get(movieId);

    if (!userMovie?._id) return;

    this.userMoviesService.deleteUserMovie(userMovie._id).subscribe({
      next: () => this.loadUserMoviesIfLoggedIn(),
      error: (err) => {
        this.userMoviesError.set(apiErrorMessage(err, 'Failed to remove from your list.'));
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
  }): MovieUpdateRequest {
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

  editFieldMessage(field: 'title' | 'year' | 'duration' | 'posterUrl' | 'overview'): string {
    return validationMessage(this.editForm.controls[field], field);
  }
}
