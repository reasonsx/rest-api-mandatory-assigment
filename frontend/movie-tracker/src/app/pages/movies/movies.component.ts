import {Component, OnInit, signal} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {MultiSelectModule} from 'primeng/multiselect';
import {ButtonModule} from 'primeng/button';

import {ApiService} from '../../services/api.service';
import {AuthService} from '../../services/auth.service';

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
  ],
  templateUrl: './movies.component.html',
})
export class MoviesComponent implements OnInit {
  // signals
  movies = signal<any[]>([]);
  loading = signal(false);
  error = signal<string>('');
  creating = signal(false);

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
    private api: ApiService,
    public auth: AuthService,
    private router: Router
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
