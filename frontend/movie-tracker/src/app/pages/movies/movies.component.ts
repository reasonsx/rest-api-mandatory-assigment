import {Component, OnInit, signal, computed} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {MultiSelectModule} from 'primeng/multiselect';
import {ButtonModule} from 'primeng/button';

import {ApiService} from '../../services/api.service';
import {AuthService} from '../../services/auth.service';
import { PaginatorModule } from 'primeng/paginator';
type GenreOption = { label: string; value: string };

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
  ],
  templateUrl: './movies.component.html',
})
export class MoviesComponent implements OnInit {
  // signals
  movies = signal<any[]>([]);
  loading = signal(false);
  error = signal<string>('');
  creating = signal(false);

  // search + pagination
  search = signal('');
  rows = signal(6);
  first = signal(0);

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

  onSearchChange(value: string) {
    this.search.set(value);
    this.first.set(0); // reset to first page after search
  }

  onPageChange(e: { first: number; rows: number }) {
    this.first.set(e.first);
    this.rows.set(e.rows);
  }

  genreOptions: GenreOption[] = [
    {label: 'Action', value: 'Action'},
    {label: 'Adventure', value: 'Adventure'},
    {label: 'Comedy', value: 'Comedy'},
    {label: 'Drama', value: 'Drama'},
    {label: 'Fantasy', value: 'Fantasy'},
    {label: 'Horror', value: 'Horror'},
    {label: 'Romance', value: 'Romance'},
    {label: 'Sci-Fi', value: 'Sci-Fi'},
    {label: 'Thriller', value: 'Thriller'},
  ];

  form = new FormGroup({
    title: new FormControl<string>('', {nonNullable: true, validators: [Validators.required]}),
    year: new FormControl<number | null>(null),
    genres: new FormControl<string[]>([], {nonNullable: true}),
    posterUrl: new FormControl<string>('', {nonNullable: true}),
  });

  constructor(
    protected api: ApiService,
    public auth: AuthService,
    protected router: Router
  ) {
  }

  ngOnInit(): void {
    this.load();
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }

  goRegister() {
    this.router.navigateByUrl('/register');
  }

  load() {
    this.loading.set(true);
    this.error.set('');

    this.api.getMovies().subscribe({
      next: (data) => {
        this.movies.set(data);
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.creating.set(true);
    this.error.set('');

    const v = this.form.getRawValue();
    const payload = {
      title: v.title,
      year: v.year ?? undefined,
      genres: v.genres,
      posterUrl: v.posterUrl.trim() ? v.posterUrl.trim() : undefined,
    };

    this.api.createMovie(payload).subscribe({
      next: () => {
        this.form.reset({title: '', year: null, genres: [], posterUrl: ''});
        this.creating.set(false);
        this.load();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to create movie');
        this.creating.set(false);
      },
    });
  }

  logout() {
    this.auth.logout();
  }
}
