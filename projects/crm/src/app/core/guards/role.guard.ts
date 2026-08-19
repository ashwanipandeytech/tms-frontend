import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const roleGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Ensure we have user data loaded if not already
  if (!authService.currentUser()) {
    try {
      await firstValueFrom(authService.getMe());
    } catch (err) {
      router.navigate(['/login']);
      return false;
    }
  }

  const expectedRoles = route.data['roles'] as Array<string>;
  
  if (expectedRoles && expectedRoles.length > 0) {
    const hasAccess = expectedRoles.some(role => authService.hasRole(role));
    
    if (!hasAccess) {
      // Prevent access
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
