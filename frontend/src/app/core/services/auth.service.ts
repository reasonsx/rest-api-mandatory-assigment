import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthHttpService } from './auth-http.service';

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  role?: 'user' | 'admin';
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: string;
  expiresInSeconds: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthHttpService);
  private readonly router = inject(Router);
  private readonly sessionSig = signal<AuthSession | null>(null);
  private logoutTimer: ReturnType<typeof setTimeout> | undefined;

  session = computed(() => this.sessionSig());
  isLoggedIn = computed(() => {
    const session = this.sessionSig();
    return !!session && this.getExpiresAtMs(session) > Date.now();
  });

  userEmail = computed(() => this.sessionSig()?.user.email ?? '');
  userRole = computed(() => this.sessionSig()?.user.role ?? 'user');
  userId = computed(() => this.sessionSig()?.user.id ?? '');
  username = computed(() => this.sessionSig()?.user.username ?? '');
  displayName = computed(() => this.username() || this.userEmail());

  isAdmin = computed(() => this.userRole() === 'admin');

  async restoreSession(): Promise<void> {
    try {
      this.setSession(await firstValueFrom(this.api.me()));
    } catch {
      this.clearSession();
    }
  }

  setSession(session: AuthSession): void {
    const expiresAtMs = this.getExpiresAtMs(session);

    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
      this.clearSession();
      return;
    }

    this.sessionSig.set(session);
    this.scheduleAutoLogout(expiresAtMs);
  }

  clearSession(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = undefined;
    }

    this.sessionSig.set(null);
  }

  logout(options: { remote?: boolean; redirectTo?: string } = {}): void {
    if (options.remote !== false) {
      this.api.logout().subscribe({ error: () => undefined });
    }

    this.clearSession();

    if (options.redirectTo) {
      void this.router.navigateByUrl(options.redirectTo);
    }
  }

  expireSession(): void {
    this.logout({ redirectTo: '/login' });
  }

  private scheduleAutoLogout(expiresAtMs: number): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    this.logoutTimer = setTimeout(() => this.expireSession(), Math.max(0, expiresAtMs - Date.now()));
  }

  private getExpiresAtMs(session: AuthSession): number {
    return Date.parse(session.expiresAt);
  }
}
