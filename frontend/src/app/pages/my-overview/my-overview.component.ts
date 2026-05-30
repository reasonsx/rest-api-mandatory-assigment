import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { PrimeIcons } from 'primeng/api';

import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import {
  UserMovie,
  UserMoviesService,
  UserMovieUpdateRequest,
  WatchStatus
} from '../../core/services/user-movies.service';
import { apiErrorMessage } from '../../core/services/api-error';

type SortOption = 'title' | 'createdAt' | 'watchedAt';

@Component({
  selector: 'app-my-overview',
  standalone: true,
  imports: [
    NavbarComponent,
    SelectModule,
    FormsModule,
    DatePipe,
    TitleCasePipe,
    ButtonModule,
    TagModule,
    InputTextModule,
  ],
  templateUrl: './my-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOverviewComponent implements OnInit {
  private readonly userMoviesService = inject(UserMoviesService);
  private readonly auth = inject(AuthService);
  protected readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly userMovies = signal<UserMovie[]>([]);

  readonly search = signal('');
  readonly selectedStatus = signal<WatchStatus>('planned');
  readonly sortBy = signal<SortOption>('title');

  readonly sortOptions = computed(() => {
    const options: { label: string; value: SortOption }[] = [
      { label: 'Title', value: 'title' },
      { label: 'Recently added', value: 'createdAt' },
    ];

    if (this.selectedStatus() === 'watched') {
      options.push({ label: 'Watched date', value: 'watchedAt' });
    }

    return options;
  });

  readonly pageTitle = 'My Overview';

  readonly overviewDescription = computed(() =>
    this.selectedStatus() === 'watched'
      ? 'Movies you have finished, with watch dates and total time.'
      : 'Movies you plan to watch next.'
  );

  readonly emptyTitle = computed(() =>
    this.selectedStatus() === 'watched' ? 'No watched movies yet' : 'Your watchlist is empty'
  );

  readonly emptyDescription = computed(() =>
    this.selectedStatus() === 'watched'
      ? 'Mark movies as watched from the catalog or from your watchlist.'
      : 'Add movies from the catalog when you want to save them for later.'
  );

  movieDuration(item: UserMovie): number {
    return typeof item.movieId === 'object' && item.movieId
      ? item.movieId.duration ?? 0
      : 0;
  }

  movieRating(item: UserMovie): number | null {
    return typeof item.movieId === 'object' && item.movieId
      ? item.movieId.rating ?? null
      : null;
  }

  movieOverview(item: UserMovie): string {
    return typeof item.movieId === 'object' && item.movieId
      ? item.movieId.overview ?? ''
      : '';
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (!minutes) return '0m';
    if (!hours) return `${mins}m`;
    if (!mins) return `${hours}h`;

    return `${hours}h ${mins}m`;
  }
  readonly watchedDurationMinutes = computed(() =>
    this.watchedMovies().reduce((total, item) => total + this.movieDuration(item), 0)
  );

  readonly watchedDurationLabel = computed(() =>
    this.formatDuration(this.watchedDurationMinutes())
  );
  readonly watchlistMovies = computed(() =>
    this.userMovies().filter((movie) => movie.status === 'planned')
  );

  readonly watchedMovies = computed(() =>
    this.userMovies().filter((movie) => movie.status === 'watched')
  );

  readonly filteredMovies = computed(() => {
    const query = this.search().trim().toLowerCase();
    const selectedSort = this.sortBy();
    const selectedStatus = this.selectedStatus();

    return [...this.userMovies()]
      .filter((item) => item.status === selectedStatus)
      .filter((item) => {
        const title = this.movieTitle(item).toLowerCase();
        const year = this.movieYear(item);
        const status = item.status;

        const matchesSearch =
          !query ||
          title.includes(query) ||
          String(year ?? '').includes(query) ||
          status.includes(query);

        return matchesSearch;
      })
      .sort((a, b) => {
        if (selectedSort === 'watchedAt') {
          return String(b.watchedAt ?? '').localeCompare(String(a.watchedAt ?? ''));
        }

        if (selectedSort === 'createdAt') {
          return String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? ''));
        }

        return this.movieTitle(a).localeCompare(this.movieTitle(b));
      });
  });

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.loadUserMovies();
  }

  loadUserMovies(): void {
    const userId = this.auth.userId();

    if (!userId) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.userMoviesService.getUserMovies(userId).subscribe({
      next: (data) => {
        this.userMovies.set((data ?? []).filter((item) => item.movieId));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(apiErrorMessage(err, 'Failed to load your overview.'));
        this.loading.set(false);
      },
    });
  }

  onSearchChange(value: string): void {
    this.search.set(value);
  }

  setSelectedStatus(status: WatchStatus): void {
    this.selectedStatus.set(status);

    if (status === 'planned' && this.sortBy() === 'watchedAt') {
      this.sortBy.set('title');
    }
  }

  changeStatus(userMovieId: string, status: WatchStatus): void {
    const patch: UserMovieUpdateRequest = {
      status,
      watchedAt: status === 'watched' ? new Date().toISOString() : undefined,
    };

    this.userMoviesService.updateUserMovie(userMovieId, patch).subscribe({
      next: () => this.loadUserMovies(),
      error: (err) => {
        this.error.set(apiErrorMessage(err, 'Failed to update status.'));
      },
    });
  }

  removeMovie(item: UserMovie): void {
    if (!item._id) return;

    this.userMoviesService.deleteUserMovie(item._id).subscribe({
      next: () => this.loadUserMovies(),
      error: (err) => {
        this.error.set(apiErrorMessage(err, 'Failed to remove movie.'));
      },
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.sortBy.set('title');
  }

  movieTitle(item: UserMovie): string {
    return typeof item.movieId === 'object' && item.movieId
      ? item.movieId.title ?? 'Unknown movie'
      : 'Unknown movie';
  }

  movieYear(item: UserMovie): number | null {
    return typeof item.movieId === 'object' && item.movieId
      ? item.movieId.year ?? null
      : null;
  }

  moviePoster(item: UserMovie): string {
    return typeof item.movieId === 'object' && item.movieId ? item.movieId.posterUrl ?? '' : '';
  }

  statusSeverity(status: WatchStatus): 'success' | 'secondary' {
    if (status === 'watched') return 'success';
    return 'secondary';
  }

  protected readonly PrimeIcons = PrimeIcons;
}
