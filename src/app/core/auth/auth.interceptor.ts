import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@/core/auth/auth.service';
import { AuthUtils } from '@/core/auth/auth.utils';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    const authService = inject(AuthService);
    
    // Clone the request object
    let newReq = req;

    // Add authorization header if token exists and is not expired
    if (authService.accessToken && !AuthUtils.isTokenExpired(authService.accessToken)) {
        newReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${authService.accessToken}`)
        });
    }

    // Handle the request and catch errors
    return next(newReq).pipe(
        catchError((error) => {
            // Handle 401 Unauthorized responses
            if (error instanceof HttpErrorResponse && error.status === 401) {
                    // Sign out
                    authService.signOut();

                    // Reload the app
                    location.reload();
                }

                return throwError(() => error);
            })
        );
    }
