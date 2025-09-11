import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './core/services/auth';
import { environment } from '../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = this.authService.getToken();

    // Only attach the token to requests intended for our own API.
    // This is more secure than a blocklist (e.g., ignoring cloudinary).
    if (authToken && request.url.startsWith(environment.apiUrl)) {
      const authReq = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${authToken}`),
      });
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // If the API returns a 401 Unauthorized, the session is invalid.
          // Trigger a global logout.
          if (error.status === 401) {
            
            this.authService.logout();
          }
          // Re-throw the error so it can be handled by other parts of the application if needed.
          return throwError(() => error);
        })
      );
    }
    return next.handle(request);
  }
}
