import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    return router.createUrlTree(['/auth/login']);
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role === 'Admin') {
      return true;
    }
  } catch {
    return router.createUrlTree(['/auth/login']);
  }

  return router.createUrlTree(['/dashboard']);
};
