import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') ?? '').toLowerCase().replace(/[\s_]/g, '');
  if (token && role === 'admin') return true;
  router.navigate(['/login']);
  return false;
};
