import { Routes } from '@angular/router';
import { icAuthGuard }          from './core/guards/ic-auth.guard';
import { qcoAuthGuard }         from './core/guards/qco-auth.guard';
import { pharmacistAuthGuard }  from './core/guards/pharmacist-auth.guard';
import { adminAuthGuard }       from './core/guards/admin-auth.guard';
import { procurementAuthGuard } from './core/guards/procurement-auth.guard';

export const routes: Routes = [

  // ── Default → Unified Login ───────────────────────────────────────────────
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/unified-login/unified-login').then(
        (m) => m.UnifiedLoginComponent
      ),
  },

  // Legacy alias — redirect old paths to unified login
  { path: 'ic/login',  redirectTo: 'login', pathMatch: 'full' },

  // ── Inventory Controller (/ic/*) ──────────────────────────────────────────
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

  // ── Quality & Compliance Officer (/qco/*) ─────────────────────────────────
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

  // ── Pharmacist (/pharmacist/*) ────────────────────────────────────────────
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

  // ── Admin (/admin/*) ──────────────────────────────────────────────────────
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout').then(
        (m) => m.AdminLayout
      ),
    canActivate: [adminAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/admin-dashboard').then(
            (m) => m.AdminDashboard
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/user/user').then((m) => m.UserComponent),
      },
      {
        path: 'drugs',
        loadComponent: () =>
          import('./features/drug/drug').then((m) => m.DrugComponent),
      },
      {
        path: 'locations',
        loadComponent: () =>
          import('./features/location/location').then((m) => m.LocationComponent),
      },
      {
        path: 'bins',
        loadComponent: () =>
          import('./features/bin/bin').then((m) => m.BinComponent),
      },
      {
        path: 'items',
        loadComponent: () =>
          import('./features/item/item').then((m) => m.ItemComponent),
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./features/audit/audit').then((m) => m.AuditComponent),
      },
    ],
  },

  // ── Procurement Officer (/procurement/*) ─────────────────────────────────
  {
    path: 'procurement',
    loadComponent: () =>
      import('./features/procurement/procurement-layout/procurement-layout').then(
        (m) => m.ProcurementLayoutComponent
      ),
    canActivate: [procurementAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/procurement/procurement-dashboard').then(
            (m) => m.ProcurementDashboard
          ),
      },
      {
        path: 'purchase-orders',
        loadComponent: () =>
          import('./features/purchase-order/purchase-order').then(
            (m) => m.PurchaseOrderComponent
          ),
      },
      {
        path: 'vendors',
        loadComponent: () =>
          import('./features/vendor/vendor').then(
            (m) => m.VendorComponent
          ),
      },
      {
        path: 'grn',
        loadComponent: () =>
          import('./features/procurement/grn/procurement-grn').then(
            (m) => m.ProcurementGrnComponent
          ),
      },
      {
        path: 'goods-receipt',
        loadComponent: () =>
          import('./features/procurement/grn/procurement-grn').then(
            (m) => m.ProcurementGrnComponent
          ),
      },
      {
        path: 'items',
        loadComponent: () =>
          import('./features/item/item').then(
            (m) => m.ItemComponent
          ),
      },
    ],
  },

  // ── Catch-all → Login ─────────────────────────────────────────────────────
  { path: '**', redirectTo: 'login' },
];
