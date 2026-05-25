import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { PrimeIcons } from 'primeng/api';

import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import {
  UserMovie,
  UserMoviesService,
  UserMovieUpdateRequest,
  WatchStatus
} from '../../services/user-movies.service';

type SortOption = 'title' | 'createdAt' | 'watchedAt';

@Component({
  selector: 'app-my-watchlist',
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
  templateUrl: './my-watchlist.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyWatchlistComponent implements OnInit {
  private readonly userMoviesService = inject(UserMoviesService);
  private readonly auth = inject(AuthService);
  protected readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly myMovies = signal<UserMovie[]>([]);

  readonly search = signal('');
  readonly pageStatus = signal<WatchStatus>('planned');
  readonly sortBy = signal<SortOption>('title');

  readonly sortOptions = computed(() => {
    const options: { label: string; value: SortOption }[] = [
      { label: 'Title', value: 'title' },
      { label: 'Recently added', value: 'createdAt' },
    ];

    if (this.pageStatus() === 'watched') {
      options.push({ label: 'Watched date', value: 'watchedAt' });
    }

    return options;
  });

  readonly pageTitle = computed(() =>
    'My Overview'
  );

  readonly pageDescription = computed(() =>
    this.pageStatus() === 'watched'
      ? 'Movies you have finished, with watch dates and total time.'
      : 'Movies you plan to watch next.'
  );

  readonly emptyTitle = computed(() =>
    this.pageStatus() === 'watched' ? 'No watched movies yet' : 'Your watchlist is empty'
  );

  readonly emptyDescription = computed(() =>
    this.pageStatus() === 'watched'
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
    this.watched().reduce((total, item) => total + this.movieDuration(item), 0)
  );

  readonly watchedDurationLabel = computed(() =>
    this.formatDuration(this.watchedDurationMinutes())
  );
  readonly planned = computed(() =>
    this.myMovies().filter((movie) => movie.status === 'planned')
  );

  readonly watched = computed(() =>
    this.myMovies().filter((movie) => movie.status === 'watched')
  );

  readonly filteredMovies = computed(() => {
    const query = this.search().trim().toLowerCase();
    const selectedSort = this.sortBy();
    const selectedStatus = this.pageStatus();

    return [...this.myMovies()]
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

    this.loadMyMovies();
  }

  loadMyMovies(): void {
    const userId = this.auth.userId();

    if (!userId) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.userMoviesService.getUserMovies(userId).subscribe({
      next: (data) => {
        this.myMovies.set((data ?? []).filter((item) => item.movieId));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load your watchlist');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(value: string): void {
    this.search.set(value);
  }

  setPageStatus(status: WatchStatus): void {
    this.pageStatus.set(status);

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
      next: () => this.loadMyMovies(),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to update status');
      },
    });
  }

  removeFromWatchlist(item: UserMovie): void {
    if (!item._id) return;

    this.userMoviesService.deleteUserMovie(item._id).subscribe({
      next: () => this.loadMyMovies(),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to remove movie');
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
