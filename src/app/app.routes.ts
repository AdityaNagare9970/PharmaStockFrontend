import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { icAuthGuard } from './core/guards/ic-auth.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: 'ic/login', pathMatch: 'full' },

  // Existing admin login (keep as-is for admin team)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.LoginComponent),
  },

  // Existing admin routes (leave untouched for admin team)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'drugs',
    loadComponent: () =>
      import('./features/drugs/drug-list/drug-list').then((m) => m.DrugListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'drugs/add',
    loadComponent: () =>
      import('./features/drugs/drug-form/drug-form').then((m) => m.DrugFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'drugs/edit/:id',
    loadComponent: () =>
      import('./features/drugs/drug-form/drug-form').then((m) => m.DrugFormComponent),
    canActivate: [authGuard],
  },

  // ─── Inventory Controller routes ──────────────────────────────────────────
  {
    path: 'ic/login',
    loadComponent: () =>
      import('./features/inventory-controller/ic-login/ic-login').then(
        (m) => m.IcLoginComponent
      ),
  },
  {
    path: 'ic',
    loadComponent: () =>
      import('./features/inventory-controller/ic-layout/ic-layout').then(
        (m) => m.IcLayoutComponent
      ),
    canActivate: [icAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/inventory-controller/dashboard/ic-dashboard').then(
            (m) => m.IcDashboardComponent
          ),
      },
      {
        path: 'inventory-lots',
        loadComponent: () =>
          import('./features/inventory-controller/inventory-lots/inventory-lots').then(
            (m) => m.InventoryLotsComponent
          ),
      },
      {
        path: 'expiry-watch',
        loadComponent: () =>
          import('./features/inventory-controller/expiry-watch/expiry-watch').then(
            (m) => m.ExpiryWatchComponent
          ),
      },
      {
        path: 'transfer-orders',
        loadComponent: () =>
          import('./features/inventory-controller/transfer-orders/transfer-orders').then(
            (m) => m.TransferOrdersComponent
          ),
      },
      {
        path: 'replenishment',
        loadComponent: () =>
          import('./features/inventory-controller/replenishment/replenishment').then(
            (m) => m.ReplenishmentComponent
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'ic/login' },
];
