import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PrimeIcons } from 'primeng/api';
import { CardModule } from 'primeng/card';

import { AuthService } from '../../core/services/auth.service';
import { UserMoviesService, UserMovie } from '../../core/services/user-movies.service';
import { UserService, UserProfile } from '../../core/services/user.service';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    NavbarComponent,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly userMoviesService = inject(UserMoviesService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  readonly PrimeIcons = PrimeIcons;
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly userMovies = signal<UserMovie[]>([]);

  readonly userProfile = signal<UserProfile>({
    _id: '',
    email: '',
    username: '',
    profileImageUrl: '',
    role: 'user'
  });


  readonly profileForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    profileImageUrl: new FormControl('', { nonNullable: true }),
  });

  readonly stats = computed(() => {
    const movies = this.userMovies();
    const watched = movies.filter((movie) => movie.status === 'watched');

    const totalMinutes = watched.reduce((acc, item) => {
      const duration = typeof item.movieId === 'object' ? item.movieId?.duration ?? 0 : 0;
      return acc + duration;
    }, 0);

    return {
      total: movies.length,
      watched: watched.length,
      planned: movies.filter((movie) => movie.status === 'planned').length,
      timeSpent: this.formatDuration(totalMinutes)
    };
  });

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.userService.loadProfile(this.auth.userId()!).subscribe({
      next: (user) => {
        this.userProfile.set(user);
        this.profileForm.patchValue({
          username: user.username,
          profileImageUrl: user.profileImageUrl
        });
      }
    });

    this.loadUserMovieStats();
  }

  loadUserMovieStats(): void {
    const userId = this.auth.userId();
    if (!userId) return;

    this.loading.set(true);
    this.userMoviesService.getUserMovies(userId).subscribe({
      next: (movies) => {
        this.userMovies.set(movies ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.saving.set(true);
    const userId = this.auth.userId()!;

    this.userService.updateProfile(userId, this.profileForm.getRawValue()).subscribe({
      next: (updatedUser) => {
        this.userProfile.set(updatedUser);
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h ${minutes % 60}m`;
  }
}
