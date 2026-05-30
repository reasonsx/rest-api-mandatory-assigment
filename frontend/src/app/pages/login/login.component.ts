import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { AuthService } from '../../core/services/auth.service';
import { AuthHttpService } from '../../core/services/auth-http.service';
import { applyApiFieldErrors, apiErrorMessage, clearApiFieldErrors } from '../../core/services/api-error';
import {
  maxUtf8Bytes,
  validationMessage,
  VALIDATION_LIMITS,
} from '../../core/validation/validation-messages';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loading = signal(false);
  error = signal<string>('');

  form = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email,
        Validators.maxLength(VALIDATION_LIMITS.emailMaxLength),
      ],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(VALIDATION_LIMITS.passwordMinLength),
        maxUtf8Bytes(VALIDATION_LIMITS.bcryptPasswordMaxBytes),
      ],
    }),
  });

  constructor(
    private api: AuthHttpService,
    private auth: AuthService,
    private router: Router
  ) {}

  submit() {
    clearApiFieldErrors(this.form);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const v = this.form.getRawValue();

    this.api.login({ email: v.email.trim().toLowerCase(), password: v.password }).subscribe({
      next: (res) => {
        this.auth.setSession(res);
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        applyApiFieldErrors(this.form, err);
        this.error.set(apiErrorMessage(err, 'Login failed.'));
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  fieldMessage(field: 'email' | 'password'): string {
    return validationMessage(this.form.controls[field], field);
  }
}
