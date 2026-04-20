import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { VendorComponent } from './features/vendor/vendor';
import { PurchaseOrderComponent } from './features/purchase-order/purchase-order';
import { PurchaseItemComponent } from './features/purchase-item/purchase-item';
import { Shell } from './features/shell/shell';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'auth/login', component: Login },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'vendors',
        component: VendorComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'procurementofficer'] },
      },
      {
        path: 'purchase-orders',
        component: PurchaseOrderComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'procurementofficer'] },
      },
      {
        path: 'purchase-items',
        component: PurchaseItemComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'procurementofficer'] },
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
