import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SelectModule } from 'primeng/select';

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

@Component({
  selector: 'app-my-watchlist',
  standalone: true,
  imports: [
    NavbarComponent,
    SelectModule,
    FormsModule,
    DatePipe,
  ],
  templateUrl: './my-watchlist.component.html',
})
export class MyWatchlistComponent implements OnInit {
  loading = signal(false);
  error = signal('');
  myMovies = signal<UserMovieLike[]>([]);

  statusOptions: StatusOption[] = [
    { label: 'Planned', value: 'planned' },
    { label: 'Watching', value: 'watching' },
    { label: 'Watched', value: 'watched' },
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

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
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

  movieTitle(item: UserMovieLike) {
    if (typeof item.movieId === 'object') {
      return item.movieId?.title ?? 'Unknown movie';
    }

    return 'Unknown movie';
  }
}
