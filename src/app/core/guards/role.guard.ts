import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: string[] = route.data['roles'] ?? [];

  // No roles defined on route → allow all authenticated users
  if (allowedRoles.length === 0) return true;

  if (authService.hasRole(...allowedRoles)) return true;

  // Role not allowed → redirect to dashboard
  return router.createUrlTree(['/dashboard']);
import { CanActivateFn, Router } from '@angular/router';

const ROLE_ROUTES: Record<string, string> = {
  'Admin': '/admin',
  'Procurement Officer': '/procurement',
  'Inventory Controller': '/inventory',
  'Quality Officer': '/quality',
  'Pharmacist': '/pharmacist'
};

export const roleGuard = (allowedRole: string): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const token = localStorage.getItem('token');

    if (!token) {
      return router.createUrlTree(['/auth/login']);
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role === allowedRole) {
        return true;
      }
      // Wrong role — send them to their own dashboard
      return router.createUrlTree([ROLE_ROUTES[payload.role] ?? '/auth/login']);
    } catch {
      return router.createUrlTree(['/auth/login']);
    }
  };
};
