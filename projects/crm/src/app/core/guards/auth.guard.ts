import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // If on server, assume true to prevent redirecting authenticated users to login,
  // which causes a login page flicker during hydration.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.getToken()) {
    return true;
  }

  // Not logged in, redirect to login page
  router.navigate(['/login']);
  return false;
};
