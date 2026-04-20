import { inject } from '@angular/core';
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
