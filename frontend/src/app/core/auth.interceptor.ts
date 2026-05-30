import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isApiRequest = req.url.startsWith('/api') || req.url.includes('/api/');
  const isLoginEndpoint = req.url.includes('/auth/login');
  const isAuthEndpoint =
    isLoginEndpoint || req.url.includes('/auth/me') || req.url.includes('/auth/logout');

  const request = isApiRequest ? req.clone({ withCredentials: true }) : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (isApiRequest && error instanceof HttpErrorResponse && error.status === 401) {
        if (!isLoginEndpoint) {
          auth.clearSession();
        }

        if (!isAuthEndpoint) {
          void router.navigateByUrl('/login');
        }
      }

      return throwError(() => error);
    })
  );
};
