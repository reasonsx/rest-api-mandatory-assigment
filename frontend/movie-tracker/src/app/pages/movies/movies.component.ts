import { Component, OnInit, computed, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import type { PaginatorState } from 'primeng/paginator';
import { ApiService, MovieLike, UserMovieLike, WatchStatus } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SelectModule } from 'primeng/select';

type GenreOption = { label: string; value: string };
type StatusOption = { label: string; value: WatchStatus };

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    MultiSelectModule,
    ButtonModule,
    PaginatorModule,
    DialogModule,
    TagModule,
    TooltipModule,
    SelectModule,
    FormsModule,
  ],
  templateUrl: './movies.component.html',
})
export class MoviesComponent implements OnInit {
  // state (signals)
  movies = signal<MovieLike[]>([]);
  loading = signal(false);
  error = signal('');
  creating = signal(false);

  // search + pagination
  search = signal('');
  rows = signal(6);
  first = signal(0);

  // admin edit dialog
  editOpen = signal(false);
  editing = signal(false);
  editTarget = signal<MovieLike | null>(null);

  // my list
  myLoading = signal(false);
  myError = signal('');
  myMovies = signal<UserMovieLike[]>([]);

  // options
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

  statusOptions: StatusOption[] = [
    { label: 'Planned', value: 'planned' },
    { label: 'Watching', value: 'watching' },
    { label: 'Watched', value: 'watched' },
  ];

  // derived lists
  filteredMovies = computed(() => {
    const q = this.search().trim().toLowerCase();
    const all = this.movies();
    if (!q) return all;

    return all.filter((m) => {
      const title = String(m?.title ?? '').toLowerCase();
      const year = String(m?.year ?? '');
      const genres = Array.isArray(m?.genres) ? m.genres.join(' ').toLowerCase() : '';
      return title.includes(q) || year.includes(q) || genres.includes(q);
    });
  });

  pagedMovies = computed(() => {
    const start = this.first();
    const end = start + this.rows();
    return this.filteredMovies().slice(start, end);
  });

  showPaginator = computed(() => this.filteredMovies().length > this.rows());

  // quick lookup: movieId -> userMovie record
  myIndex = computed(() => {
    const map = new Map<string, UserMovieLike>();
    for (const um of this.myMovies()) {
      const id = typeof um.movieId === 'string' ? um.movieId : (um.movieId?._id ?? '');
      if (id) map.set(id, um);
    }
    return map;
  });

  // forms
  public form = new FormGroup({
    title: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    year: new FormControl<number | null>(null),
    genres: new FormControl<string[]>([], { nonNullable: true }),
    posterUrl: new FormControl<string>('', { nonNullable: true }),
  });

  public editForm = new FormGroup({
    title: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    year: new FormControl<number | null>(null),
    genres: new FormControl<string[]>([], { nonNullable: true }),
    posterUrl: new FormControl<string>('', { nonNullable: true }),
  });

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMovies();
    this.loadMyListIfLoggedIn();
  }

  // header nav
  goLogin() { this.router.navigateByUrl('/login'); }
  goRegister() { this.router.navigateByUrl('/register'); }

  logout() {
    this.auth.logout();
    this.myMovies.set([]);
  }

  // search + paging
  onSearchChange(value: string) {
    this.search.set(value);
    this.first.set(0);
  }

  onPageChange(e: PaginatorState) {
    this.first.set(e.first ?? 0);
    this.rows.set(e.rows ?? this.rows());
  }

  get titleCtrl() { return this.form.controls.title; }
  get editTitleCtrl() { return this.editForm.controls.title; }

  // ===== Movies catalog =====
  loadMovies() {
    this.loading.set(true);
    this.error.set('');

    this.api.getMovies().subscribe({
      next: (data) => {
        this.movies.set(data ?? []);
        this.first.set(0);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load movies');
        this.loading.set(false);
      },
    });
  }

  create() {
    if (!this.auth.isAdmin()) {
      this.error.set('Admin only.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.creating.set(true);
    this.error.set('');

    const v = this.form.getRawValue();
    const payload: MovieLike = {
      title: v.title,
      year: v.year ?? undefined,
      genres: v.genres,
      posterUrl: v.posterUrl.trim() ? v.posterUrl.trim() : undefined,
    };

    this.api.createMovie(payload).subscribe({
      next: () => {
        this.form.reset({ title: '', year: null, genres: [], posterUrl: '' });
        this.creating.set(false);
        this.loadMovies();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to create movie');
        this.creating.set(false);
      },
    });
  }

  openEdit(m: MovieLike) {
    if (!this.auth.isAdmin()) return;

    this.editTarget.set(m);
    this.editForm.reset({
      title: m.title ?? '',
      year: (m.year ?? null) as any,
      genres: (m.genres ?? []) as any,
      posterUrl: m.posterUrl ?? '',
    });
    this.editOpen.set(true);
  }

  closeEdit() {
    this.editOpen.set(false);
    this.editTarget.set(null);
  }

  saveEdit() {
    if (!this.auth.isAdmin()) return;
    const target = this.editTarget();
    if (!target?._id) return;

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.editing.set(true);

    const v = this.editForm.getRawValue();
    const patch: Partial<MovieLike> = {
      title: v.title,
      year: v.year ?? undefined,
      genres: v.genres,
      posterUrl: v.posterUrl.trim() ? v.posterUrl.trim() : undefined,
    };

    this.api.updateMovie(target._id, patch).subscribe({
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

  deleteMovie(m: MovieLike) {
    if (!this.auth.isAdmin()) return;
    if (!m._id) return;

    this.api.deleteMovie(m._id).subscribe({
      next: () => this.loadMovies(),
      error: (err) => this.error.set(err?.error?.message ?? 'Failed to delete movie'),
    });
  }

  // ===== My list (user movies) =====
  loadMyListIfLoggedIn() {
    if (!this.auth.isLoggedIn()) return;
    const userId = this.auth.userId();
    if (!userId) return;

    this.myLoading.set(true);
    this.myError.set('');

    this.api.getUserMovies(userId).subscribe({
      next: (data) => {
        this.myMovies.set(data ?? []);
        this.myLoading.set(false);
      },
      error: (err) => {
        this.myError.set(err?.error?.message ?? 'Failed to load your list');
        this.myLoading.set(false);
      },
    });
  }

  addToMyList(movieId: string) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const userId = this.auth.userId();
    if (!userId) return;

    this.api.addMovieToUser(userId, movieId).subscribe({
      next: () => this.loadMyListIfLoggedIn(),
      error: (err) => this.myError.set(err?.error?.message ?? 'Failed to add to your list'),
    });
  }

  changeStatus(movieId: string, status: WatchStatus) {
    const um = this.myIndex().get(movieId);
    if (!um?._id) return;

    const patch: Partial<UserMovieLike> = {
      status,
      watchedAt: status === 'watched' ? new Date().toISOString() : undefined,
    };

    this.api.updateUserMovie(um._id, patch).subscribe({
      next: () => this.loadMyListIfLoggedIn(),
      error: (err) => this.myError.set(err?.error?.message ?? 'Failed to update status'),
    });
  }

  removeFromMyList(movieId: string) {
    const um = this.myIndex().get(movieId);
    if (!um?._id) return;

    this.api.deleteUserMovie(um._id).subscribe({
      next: () => this.loadMyListIfLoggedIn(),
      error: (err) => this.myError.set(err?.error?.message ?? 'Failed to remove from your list'),
    });
  }
}
