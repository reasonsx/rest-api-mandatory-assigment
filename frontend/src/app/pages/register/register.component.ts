import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  loading = signal(false);
  error = signal<string>('');
  ok = signal<string>('');

  form = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    username: new FormControl<string>('', { nonNullable: true }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  constructor(private api: ApiService, private router: Router) {}

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.ok.set('');

    const v = this.form.getRawValue();

    this.api
      .register({
        email: v.email,
        username: v.username.trim() ? v.username.trim() : undefined,
        password: v.password,
      })
      .subscribe({
        next: () => {
          this.ok.set('Account created. Redirecting to login...');
          setTimeout(() => this.router.navigateByUrl('/login'), 700);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Register failed');
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }
}
