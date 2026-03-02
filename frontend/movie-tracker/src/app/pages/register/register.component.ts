import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  email = '';
  username = '';
  password = '';
  error = '';
  ok = '';

  constructor(private api: ApiService, private router: Router) {}

  submit() {
    this.error = '';
    this.ok = '';
    this.api
      .register({ email: this.email, username: this.username || undefined, password: this.password })
      .subscribe({
        next: () => {
          this.ok = 'Account created. You can login now.';
          setTimeout(() => this.router.navigateByUrl('/login'), 500);
        },
        error: (err) => {
          this.error = err?.error?.message ?? 'Register failed';
        },
      });
  }
}