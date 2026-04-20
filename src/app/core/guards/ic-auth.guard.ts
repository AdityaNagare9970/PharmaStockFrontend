import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const icAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') ?? '').toLowerCase().replace(/\s+/g, '');

  const isIC = role === 'inventorycontroller' || role === 'inventory_controller';

  if (token && isIC) {
    return true;
  }

  router.navigate(['/ic/login']);
  return false;
};
