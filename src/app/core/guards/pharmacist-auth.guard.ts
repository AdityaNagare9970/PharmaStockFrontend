import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const pharmacistAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') ?? '').toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
  if (token && role === 'pharmacist') return true;
  router.navigate(['/login']);
  return false;
};
