import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';

// Track the last alert time and message to prevent duplicates
let lastAlertTime = 0;
let lastAlertMessage = '';
const ALERT_DEBOUNCE_MS = 100;

export const alertInterceptor: HttpInterceptorFn = (req, next) => {
  const alertService = inject(AlertService);
  const method = req.method.toUpperCase();

  // Only intercept POST, PATCH, PUT requests
  if (!['POST', 'PATCH', 'PUT'].includes(method)) {
    return next(req);
  }

  // Skip alert interceptor for login requests
  if (req.url.includes('/login')) {
    return next(req);
  }

  let alertShown = false;

  return next(req).pipe(
    map((response: unknown) => {
      // Handle both cases: HttpResponse (when observe: 'response' is used) 
      // or body directly (default behavior for 2xx responses)
      if (response instanceof HttpResponse) {
        // We have the full HttpResponse - check status code explicitly
        const status = response.status;
        
        // Only show success for actual success status codes (2xx)
        if (status >= 200 && status < 300 && !alertShown) {
          const now = Date.now();
          let message = 'Operation completed successfully';
          
          // Customize message based on method
          if (method === 'POST') {
            message = 'Created successfully';
          } else if (method === 'PATCH' || method === 'PUT') {
            message = 'Updated successfully';
          }

          // Debounce: only show if it's a different message or enough time has passed
          if (message !== lastAlertMessage || now - lastAlertTime > ALERT_DEBOUNCE_MS) {
            alertService.success(message);
            lastAlertTime = now;
            lastAlertMessage = message;
            alertShown = true;
          }
        }
        
        // Return the body for downstream consumers (maintains original API)
        return response.body;
      } else {
        // Not an HttpResponse - this means HttpClient emitted the body directly
        // HttpClient only emits body for 2xx responses, so this is definitely a success
        // However, to be extra safe, we'll only show success if we haven't already shown an error
        if (!alertShown) {
          const now = Date.now();
          let message = 'Operation completed successfully';
          
          // Customize message based on method
          if (method === 'POST') {
            message = 'Created successfully';
          } else if (method === 'PATCH' || method === 'PUT') {
            message = 'Updated successfully';
          }

          // Debounce: only show if it's a different message or enough time has passed
          if (message !== lastAlertMessage || now - lastAlertTime > ALERT_DEBOUNCE_MS) {
            alertService.success(message);
            lastAlertTime = now;
            lastAlertMessage = message;
            alertShown = true;
          }
        }
        
        return response;
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // Error case - prevent duplicate alerts
      if (alertShown) {
        return throwError(() => error);
      }

      let message = 'Operation failed';
      
      if (error.error?.message) {
        message = error.error.message;
      } else if (error.message) {
        message = error.message;
      } else if (error.status === 0) {
        message = 'Network error. Please check your connection.';
      } else if (error.status >= 400 && error.status < 500) {
        message = 'Request failed. Please check your input.';
      } else if (error.status >= 500) {
        message = 'Server error. Please try again later.';
      }

      const now = Date.now();
      // Debounce: only show if it's a different message or enough time has passed
      if (message !== lastAlertMessage || now - lastAlertTime > ALERT_DEBOUNCE_MS) {
        alertService.error(message);
        lastAlertTime = now;
        lastAlertMessage = message;
        alertShown = true;
      }

      return throwError(() => error);
    }),
    finalize(() => {
      // Reset flag after a delay to allow new alerts
      setTimeout(() => {
        alertShown = false;
      }, ALERT_DEBOUNCE_MS);
    })
  );
};

