import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonModule, TagModule, TitleCasePipe],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  goLogin() {
    this.router.navigateByUrl('/login');
  }

  goRegister() {
    this.router.navigateByUrl('/register');
  }

  logout() {
    this.auth.logout();
  }
}
