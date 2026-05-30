import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';

import { AuthService } from './services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let auth: {
    clearSession: ReturnType<typeof vi.fn>;
  };
  let router: {
    navigateByUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    auth = {
      clearSession: vi.fn(),
    };
    router = {
      navigateByUrl: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  function runInterceptor(
    url: string,
    nextResponse = of(new HttpResponse({ status: 200 }))
  ) {
    const req = new HttpRequest('GET', url);
    let handledRequest: HttpRequest<unknown> | null = null;
    const next: HttpHandlerFn = vi.fn((request) => {
      handledRequest = request;
      return nextResponse;
    });

    const response = TestBed.runInInjectionContext(() => authInterceptor(req, next));

    return {
      response,
      handledRequest: () => handledRequest,
    };
  }

  it('sends cookies with API requests', async () => {
    const { response, handledRequest } = runInterceptor('/api/movies');

    await firstValueFrom(response);

    expect(handledRequest()?.withCredentials).toBe(true);
  });

  it('does not modify non-API requests', async () => {
    const { response, handledRequest } = runInterceptor('https://example.com/image.jpg');

    await firstValueFrom(response);

    expect(handledRequest()?.withCredentials).toBe(false);
  });

  it('clears session state and redirects on protected API 401 responses', async () => {
    const error = new HttpErrorResponse({ status: 401, url: '/api/movies' });
    const { response } = runInterceptor('/api/movies', throwError(() => error));

    await expect(firstValueFrom(response)).rejects.toBe(error);

    expect(auth.clearSession).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('does not clear an existing session when login fails', async () => {
    const error = new HttpErrorResponse({ status: 401, url: '/api/auth/login' });
    const { response } = runInterceptor('/api/auth/login', throwError(() => error));

    await expect(firstValueFrom(response)).rejects.toBe(error);

    expect(auth.clearSession).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
