import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';

import {
  ApiService,
  UserMovieLike,
  UserMovieUpdateRequest,
  WatchStatus,
} from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';

interface StatusOption {
  label: string;
  value: WatchStatus;
}

type StatusFilter = 'all' | WatchStatus;
type SortOption = 'title' | 'status' | 'watchedAt';

interface FilterOption {
  label: string;
  value: StatusFilter;
}

interface SortSelectOption {
  label: string;
  value: SortOption;
}

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
})
export class MyWatchlistComponent implements OnInit {
  loading = signal(false);
  error = signal('');
  myMovies = signal<UserMovieLike[]>([]);

  search = signal('');
  statusFilter = signal<StatusFilter>('all');
  sortBy = signal<SortOption>('title');

  statusOptions: StatusOption[] = [
    { label: 'Planned', value: 'planned' },
    { label: 'Watching', value: 'watching' },
    { label: 'Watched', value: 'watched' },
  ];

  filterOptions: FilterOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Planned', value: 'planned' },
    { label: 'Watching', value: 'watching' },
    { label: 'Watched', value: 'watched' },
  ];

  sortOptions: SortSelectOption[] = [
    { label: 'Title', value: 'title' },
    { label: 'Status', value: 'status' },
    { label: 'Watched date', value: 'watchedAt' },
  ];

  planned = computed(() =>
    this.myMovies().filter((m) => m.status === 'planned')
  );

  watching = computed(() =>
    this.myMovies().filter((m) => m.status === 'watching')
  );

  watched = computed(() =>
    this.myMovies().filter((m) => m.status === 'watched')
  );

  filteredMovies = computed(() => {
    const q = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const sort = this.sortBy();

    return this.myMovies()
      .filter((item) => {
        const title = this.movieTitle(item).toLowerCase();
        const year = this.movieYear(item);
        const itemStatus = item.status;

        const matchesSearch =
          !q ||
          title.includes(q) ||
          String(year ?? '').includes(q) ||
          itemStatus.includes(q);

        const matchesStatus = status === 'all' || itemStatus === status;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === 'status') {
          return a.status.localeCompare(b.status);
        }

        if (sort === 'watchedAt') {
          return String(b.watchedAt ?? '').localeCompare(String(a.watchedAt ?? ''));
        }

        return this.movieTitle(a).localeCompare(this.movieTitle(b));
      });
  });

  constructor(
    private api: ApiService,
    private auth: AuthService,
    protected router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.loadMyMovies();
  }

  loadMyMovies() {
    const userId = this.auth.userId();

    if (!userId) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.api.getUserMovies(userId).subscribe({
      next: (data) => {
        this.myMovies.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load your watchlist');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(value: string) {
    this.search.set(value);
  }

  changeStatus(userMovieId: string, status: WatchStatus) {
    const patch: UserMovieUpdateRequest = {
      status,
      watchedAt: status === 'watched' ? new Date().toISOString() : undefined,
    };

    this.api.updateUserMovie(userMovieId, patch).subscribe({
      next: () => this.loadMyMovies(),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to update status');
      },
    });
  }

  removeFromWatchlist(item: UserMovieLike) {
    if (!item._id) return;

    this.api.deleteUserMovie(item._id).subscribe({
      next: () => this.loadMyMovies(),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to remove movie');
      },
    });
  }

  clearFilters() {
    this.search.set('');
    this.statusFilter.set('all');
    this.sortBy.set('title');
  }

  movieTitle(item: UserMovieLike) {
    if (typeof item.movieId === 'object') {
      return item.movieId?.title ?? 'Unknown movie';
    }

    return 'Unknown movie';
  }

  movieYear(item: UserMovieLike) {
    if (typeof item.movieId === 'object') {
      return item.movieId?.year ?? null;
    }

    return null;
  }

  moviePoster(item: UserMovieLike) {
    if (typeof item.movieId === 'object') {
      return item.movieId?.posterUrl ?? '';
    }

    return '';
  }

  movieGenres(item: UserMovieLike) {
    if (typeof item.movieId === 'object') {
      return item.movieId?.genres ?? [];
    }

    return [];
  }

  statusSeverity(status: WatchStatus) {
    if (status === 'watched') return 'success';
    if (status === 'watching') return 'info';
    return 'secondary';
  }
}
