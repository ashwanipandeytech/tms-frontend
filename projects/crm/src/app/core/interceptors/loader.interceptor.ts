import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  const isGetRequest = req.method === 'GET';
  const listEndpoints = [
    'leads', 'customers', 'bookings', 'quotations', 
    'itineraries', 'follow-ups', 'dashboard', 'packages', 'users', 'roles'
  ];
  
  // Check if the URL contains any of the list endpoints. 
  // It should not end with an ID (e.g. /leads/1), so we ensure there's no trailing slash + number before query params.
  const hasListEndpoint = listEndpoints.some(endpoint => req.url.includes(`/${endpoint}`));
  const isSingleItem = /\/\d+(\?.*)?$/.test(req.url); // matches /leads/1 or /leads/1?foo=bar
  
  const isListApi = isGetRequest && hasListEndpoint && !isSingleItem;

  if (isListApi) {
    // console.log('Intercepting List API for loader:', req.url);
    loaderService.showLoader();
    return next(req).pipe(
      finalize(() => {
        loaderService.hideLoader();
      })
    );
  }

  return next(req);
};
