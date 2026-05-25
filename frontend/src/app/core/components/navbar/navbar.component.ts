import {Component, computed, effect, inject} from '@angular/core';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { AuthService } from '../../../services/auth.service';
import {PrimeIcons} from 'primeng/api';
import {UserService} from '../../../services/user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonModule, TagModule, TitleCasePipe],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly router = inject(Router);
  protected readonly PrimeIcons = PrimeIcons;
  protected readonly userService = inject(UserService);

  protected readonly userProfile = this.userService.profile;
  protected readonly avatarUrl = computed(() => this.userProfile()?.profileImageUrl ?? '');
  protected readonly avatarInitial = computed(() => {
    const name = this.userProfile()?.username || this.auth.displayName() || 'U';
    return name.charAt(0).toUpperCase();
  });

  private readonly profileLoader = effect((onCleanup) => {
    if (!this.auth.isLoggedIn()) {
      this.userService.clearProfile();
      return;
    }

    const userId = this.auth.userId();
    if (!userId) return;

    const subscription = this.userService.loadProfile(userId).subscribe({
      error: () => this.userService.clearProfile(),
    });

    onCleanup(() => subscription.unsubscribe());
  });
  goLogin() {
    this.router.navigateByUrl('/login');
  }

  goRegister() {
    this.router.navigateByUrl('/register');
  }

  logout() {
    this.auth.logout();
  }
  goHome() {
    this.router.navigateByUrl('/');
  }

  goWatchlist() {
    this.router.navigateByUrl('/my-overview');
  }

  goAdmin() {
    this.router.navigateByUrl('/admin');
  }

  goProfile() {
    this.router.navigateByUrl('/profile');
  }

  isActive(path: string): boolean {
    return this.router.url === path || (path === '/my-overview' && ['/watchlist', '/watched', '/my-watchlist'].includes(this.router.url));
  }

}
