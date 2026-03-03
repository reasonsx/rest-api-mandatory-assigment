import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, InputTextModule, PasswordModule, ButtonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  submit() {
    this.error = '';
    this.loading = true;

    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.auth.setToken(res.token);
        this.router.navigateByUrl('/movies');
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Login failed';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}