import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'token';

  setToken(token: string) {
    localStorage.setItem(this.key, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.key);
  }

  logout() {
    localStorage.removeItem(this.key);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}