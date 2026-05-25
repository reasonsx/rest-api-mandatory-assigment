import {Component, inject} from '@angular/core';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { AuthService } from '../../../services/auth.service';
import {PrimeIcons} from 'primeng/api';

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
