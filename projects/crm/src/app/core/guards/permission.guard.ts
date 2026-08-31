import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermissions = route.data['permissions'] as Array<string>;

  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = authService.hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
