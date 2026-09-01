import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token = null;
  let tenantId = null;
  // Check if we are in the browser
  if (typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('authToken');
    tenantId = localStorage.getItem('activeTenantId');
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

  const isExcludedApi = req.url.includes('/admin/tenants') || req.url.includes('/roles') || req.url.includes('/permissions') || req.url.includes('/me');
  
  if (tenantId && !isExcludedApi) {
    clonedRequest = clonedRequest.clone({
      setHeaders: {
        'X-Tenant-ID': tenantId
      }
    });
  }

  return next(clonedRequest);
};
