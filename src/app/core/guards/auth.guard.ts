import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

const ROLE_ROUTES: Record<string, string> = {
  'admin':                '/admin',
  'procurementofficer':   '/procurement',
  'inventorycontroller':  '/ic',
  'qualitycomplianceofficer': '/quality',
  'pharmacist':           '/pharmacist',
};

export const authGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/auth/login']);
  }

  // Redirect root or /dashboard to the role-specific dashboard
  if (state.url === '/' || state.url === '/dashboard') {
    const role = authService.getRole().toLowerCase().replace(/\s+/g, '');
    const target = ROLE_ROUTES[role] ?? '/auth/login';
    return router.createUrlTree([target]);
  }

  return true;
};
