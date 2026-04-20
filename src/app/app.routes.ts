import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { icAuthGuard } from './core/guards/ic-auth.guard';
import { qcoAuthGuard } from './core/guards/qco-auth.guard';
import { pharmacistAuthGuard } from './core/guards/pharmacist-auth.guard';

export const routes: Routes = [
  // Default → unified login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ─── Unified Login ────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/unified-login/unified-login').then(
        (m) => m.UnifiedLoginComponent
      ),
  },

  // Keep IC-specific login as alias (backward compat)
  {
    path: 'ic/login',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // ─── Admin routes (existing — untouched) ─────────────────────────────────
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

  // ─── Inventory Controller ─────────────────────────────────────────────────
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

  // ─── Quality & Compliance Officer ─────────────────────────────────────────
  {
    path: 'qco',
    loadComponent: () =>
      import('./features/quality-compliance/qco-layout/qco-layout').then(
        (m) => m.QcoLayoutComponent
      ),
    canActivate: [qcoAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/quality-compliance/dashboard/qco-dashboard').then(
            (m) => m.QcoDashboardComponent
          ),
      },
      {
        path: 'quarantine',
        loadComponent: () =>
          import('./features/quality-compliance/quarantine/quarantine').then(
            (m) => m.QuarantineComponent
          ),
      },
      {
        path: 'recalls',
        loadComponent: () =>
          import('./features/quality-compliance/recalls/recalls').then(
            (m) => m.RecallsComponent
          ),
      },
      {
        path: 'adjustments',
        loadComponent: () =>
          import('./features/quality-compliance/adjustments/adjustments').then(
            (m) => m.AdjustmentsComponent
          ),
      },
      {
        path: 'expiry',
        loadComponent: () =>
          import('./features/quality-compliance/expiry/qco-expiry').then(
            (m) => m.QcoExpiryComponent
          ),
      },
    ],
  },

  // ─── Pharmacist ───────────────────────────────────────────────────────────
  {
    path: 'pharmacist',
    loadComponent: () =>
      import('./features/pharmacist/pharmacist-layout/pharmacist-layout').then(
        (m) => m.PharmacistLayoutComponent
      ),
    canActivate: [pharmacistAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/pharmacist/dashboard/pharmacist-dashboard').then(
            (m) => m.PharmacistDashboardComponent
          ),
      },
      {
        path: 'stock',
        loadComponent: () =>
          import('./features/pharmacist/stock/pharmacist-stock').then(
            (m) => m.PharmacistStockComponent
          ),
      },
      {
        path: 'transfers',
        loadComponent: () =>
          import('./features/pharmacist/transfers/incoming-transfers').then(
            (m) => m.IncomingTransfersComponent
          ),
      },
      {
        path: 'dispense',
        loadComponent: () =>
          import('./features/pharmacist/dispense/pharmacist-dispense').then(
            (m) => m.PharmacistDispenseComponent
          ),
      },
      {
        path: 'expiry',
        loadComponent: () =>
          import('./features/pharmacist/expiry/pharmacist-expiry').then(
            (m) => m.PharmacistExpiryComponent
          ),
      },
    ],
  },

  // Wildcard
  { path: '**', redirectTo: 'login' },
];
