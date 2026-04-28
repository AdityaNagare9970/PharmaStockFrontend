import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: string[] = route.data['roles'] ?? [];

  // No roles defined on route → allow all authenticated users
  if (allowedRoles.length === 0) return true;

  if (authService.hasRole(...allowedRoles)) return true;

  // Role not allowed → redirect to login
  return router.createUrlTree(['/auth/login']);
};
