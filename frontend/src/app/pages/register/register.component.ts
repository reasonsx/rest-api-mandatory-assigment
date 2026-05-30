import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { AuthHttpService } from '../../core/services/auth-http.service';
import { applyApiFieldErrors, apiErrorMessage, clearApiFieldErrors } from '../../core/services/api-error';
import {
  maxUtf8Bytes,
  noAngleBrackets,
  validationMessage,
  VALIDATION_LIMITS,
} from '../../core/validation/validation-messages';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
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
      validators: [
        Validators.required,
        Validators.email,
        Validators.maxLength(VALIDATION_LIMITS.emailMaxLength),
      ],
    }),
    username: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.minLength(VALIDATION_LIMITS.usernameMinLength),
        Validators.maxLength(VALIDATION_LIMITS.usernameMaxLength),
        noAngleBrackets(),
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

  constructor(private api: AuthHttpService, private router: Router) {}

  submit() {
    clearApiFieldErrors(this.form);

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
        email: v.email.trim().toLowerCase(),
        username: v.username.trim() ? v.username.trim() : undefined,
        password: v.password,
      })
      .subscribe({
        next: () => {
          this.ok.set('Account created. Redirecting to login...');
          setTimeout(() => this.router.navigateByUrl('/login'), 700);
        },
        error: (err) => {
          applyApiFieldErrors(this.form, err);
          this.error.set(apiErrorMessage(err, 'Register failed.'));
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  fieldMessage(field: 'email' | 'password' | 'username'): string {
    return validationMessage(this.form.controls[field], field);
  }
}
