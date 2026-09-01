import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // If on server, assume true to prevent redirecting authenticated users to login,
  // which causes a login page flicker during hydration.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.getToken()) {
    
    // Ensure we have user data loaded to check roles
    if (!authService.currentUser()) {
      try {
        await firstValueFrom(authService.getMe());
      } catch (err) {
        // Prevent infinite loop if API fails or token is invalid
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('authToken');
        }
        router.navigate(['/login']);
        return false;
      }
    }

    // Force Super Admin to select a tenant if they haven't already
    const isSuperAdmin = authService.hasRole('Super Admin');
    const hasActiveTenant = !!authService.getActiveTenant();

    if (isSuperAdmin && !hasActiveTenant && !state.url.startsWith('/select-tenant') && !state.url.startsWith('/roles') && !state.url.startsWith('/admin')) {
      router.navigate(['/select-tenant']);
      return false;
    }

    return true;
  }

  // Not logged in, redirect to login page
  router.navigate(['/login']);
  return false;
};
