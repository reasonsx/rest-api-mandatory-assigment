import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthHttpService } from './auth-http.service';
import { AuthService, type AuthSession } from './auth.service';

function createSession(expiresInMs = 60_000): AuthSession {
  return {
    user: {
      id: 'user-1',
      email: 'user@example.com',
      username: 'movie-fan',
      role: 'admin',
    },
    expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
    expiresInSeconds: Math.floor(expiresInMs / 1000),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let api: {
    me: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let router: {
    navigateByUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useRealTimers();

    api = {
      me: vi.fn(),
      logout: vi.fn(() => of(void 0)),
    };
    router = {
      navigateByUrl: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthHttpService, useValue: api },
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    service.clearSession();
    vi.useRealTimers();
  });

  it('stores session details without exposing a JWT', () => {
    service.setSession(createSession());

    expect(service.isLoggedIn()).toBe(true);
    expect(service.userId()).toBe('user-1');
    expect(service.userEmail()).toBe('user@example.com');
    expect(service.username()).toBe('movie-fan');
    expect(service.displayName()).toBe('movie-fan');
    expect(service.isAdmin()).toBe(true);
  });

  it('rejects expired session details', () => {
    service.setSession(createSession(-1_000));

    expect(service.isLoggedIn()).toBe(false);
    expect(service.session()).toBeNull();
  });

  it('restores a valid cookie-backed session from the API', async () => {
    api.me.mockReturnValue(of(createSession()));

    await service.restoreSession();

    expect(api.me).toHaveBeenCalledTimes(1);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('clears local session state when restore fails', async () => {
    service.setSession(createSession());
    api.me.mockReturnValue(throwError(() => new Error('No session')));

    await service.restoreSession();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.session()).toBeNull();
  });

  it('logs out remotely, clears state, and redirects when requested', () => {
    service.setSession(createSession());

    service.logout({ redirectTo: '/login' });

    expect(api.logout).toHaveBeenCalledTimes(1);
    expect(service.isLoggedIn()).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('automatically logs out when the session expires', () => {
    vi.useFakeTimers();
    service.setSession(createSession(1_000));

    vi.advanceTimersByTime(1_000);

    expect(api.logout).toHaveBeenCalledTimes(1);
    expect(service.isLoggedIn()).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
