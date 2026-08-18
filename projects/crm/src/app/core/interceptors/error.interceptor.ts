import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    tap((event) => {
      // If it's a successful response and not a GET request, we might want to show a success toast.
      // But usually, it's better if components handle specific success messages.
      // However, we can intercept generic successes here if needed based on the response format.
      if (event instanceof HttpResponse) {
        const body = event.body as any;
        // Show success toast for mutating requests if they return success
        if (req.method !== 'GET' && body && body.success && body.message) {
          toastr.success(body.message, 'Success');
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'An unknown error occurred!';
      if (error.error instanceof ErrorEvent) {
        // Client side error
        errorMsg = `Error: ${error.error.message}`;
      } else {
        // Server side error
        if (error.error && error.error.message) {
          errorMsg = error.error.message;
        } else {
          errorMsg = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
      }
      toastr.error(errorMsg, 'Error');
      return throwError(() => error);
    })
  );
};
