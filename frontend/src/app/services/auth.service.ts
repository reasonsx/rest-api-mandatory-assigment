import { Injectable, signal, computed } from '@angular/core';

interface JwtPayload {
  sub?: string;
  email?: string;
  username?: string;
  role?: 'user' | 'admin';
  exp?: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSig = signal<string>(localStorage.getItem('token') ?? '');

  token = computed(() => this.tokenSig());
  isLoggedIn = computed(() => !!this.tokenSig());

  payload = computed(() => {
    const t = this.tokenSig();
    return t ? decodeJwt(t) : null;
  });

  userEmail = computed(() => this.payload()?.email ?? '');
  userRole = computed(() => this.payload()?.role ?? 'user');
  userId = computed(() => this.payload()?.sub ?? '');
  username = computed(() => this.payload()?.username ?? '');
  displayName = computed(() => this.username() || this.userEmail());

  isAdmin = computed(() => this.userRole() === 'admin');

  setToken(token: string) {
    localStorage.setItem('token', token);
    this.tokenSig.set(token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.tokenSig.set('');
  }
}
