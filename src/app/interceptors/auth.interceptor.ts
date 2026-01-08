import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - automatically log out and redirect to login
      if (error.status === 401) {
        // Don't redirect if already on login page or if it's a login request
        const isLoginRequest = req.url.includes('/login');
        const isLoginPage = router.url === '/login' || router.url.startsWith('/login');
        
        if (!isLoginRequest && !isLoginPage) {
          // Log out the user
          authService.logout();
        }
      }

      return throwError(() => error);
    })
  );
};

