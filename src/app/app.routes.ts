import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { icAuthGuard } from './core/guards/ic-auth.guard';
import { qcoAuthGuard } from './core/guards/qco-auth.guard';
import { pharmacistAuthGuard } from './core/guards/pharmacist-auth.guard';

import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { VendorComponent } from './features/vendor/vendor';
import { PurchaseOrderComponent } from './features/purchase-order/purchase-order';
import { PurchaseItemComponent } from './features/purchase-item/purchase-item';
import { Shell } from './features/shell/shell';
import { authGuard } from './core/guards/auth.guard';

import { AdminLayout } from './features/admin/admin-layout';
import { AdminDashboard } from './features/admin/admin-dashboard';
import { ProcurementDashboard } from './features/procurement/procurement-dashboard';
import { InventoryDashboard } from './features/inventory/inventory-dashboard';
import { QualityDashboard } from './features/quality/quality-dashboard';
import { PharmacistDashboard } from './features/pharmacist/pharmacist-dashboard';

import { LocationComponent } from './features/location/location';
import { UserComponent } from './features/user/user';
import { BinComponent } from './features/bin/bin';
import { DrugComponent } from './features/drug/drug';
import { ItemComponent } from './features/item/item';
import { AuditComponent } from './features/audit/audit';

import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  // Auth
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

  // ── Admin (sidebar layout with nested children) ────────
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [roleGuard('Admin')],
    children: [
      { path: '',          component: AdminDashboard   },
      { path: 'locations', component: LocationComponent },
      { path: 'users',     component: UserComponent     },
      { path: 'bins',      component: BinComponent      },
      { path: 'drugs',     component: DrugComponent     },
      { path: 'items',     component: ItemComponent     },
      { path: 'audit',     component: AuditComponent    },
    ]
  },

  // ── Procurement Officer ───────────────────────────────
  { path: 'procurement', component: ProcurementDashboard, canActivate: [roleGuard('Procurement Officer')] },

  // ── Inventory Controller ──────────────────────────────
  { path: 'inventory', component: InventoryDashboard, canActivate: [roleGuard('Inventory Controller')] },

  // ── Quality Officer ───────────────────────────────────
  { path: 'quality', component: QualityDashboard, canActivate: [roleGuard('Quality Officer')] },

  // ── Pharmacist ────────────────────────────────────────
  { path: 'pharmacist', component: PharmacistDashboard, canActivate: [roleGuard('Pharmacist')] },

  // Fallback
  { path: '',   redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }

];
