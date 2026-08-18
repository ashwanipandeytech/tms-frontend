import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token = null;
  // Check if we are in the browser
  if (typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('authToken');
  }

  let clonedRequest = req.clone({
    setHeaders: {
      'Accept': 'application/json'
    }
  });

  if (token) {
    clonedRequest = clonedRequest.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  return next(clonedRequest);
};
