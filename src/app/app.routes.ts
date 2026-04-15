import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';

import { AdminDashboard } from './features/admin/admin-dashboard';
import { ProcurementDashboard } from './features/procurement/procurement-dashboard';
import { InventoryDashboard } from './features/inventory/inventory-dashboard';
import { QualityDashboard } from './features/quality/quality-dashboard';
import { PharmacistDashboard } from './features/pharmacist/pharmacist-dashboard';

import { LocationComponent } from './features/location/location';

import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  // Auth
  { path: 'auth/login', component: Login },

  // ── Admin ─────────────────────────────────────────────
  { path: 'admin',           component: AdminDashboard,   canActivate: [roleGuard('Admin')] },
  { path: 'admin/locations', component: LocationComponent, canActivate: [roleGuard('Admin')] },
  // future: { path: 'admin/users', component: UserComponent, canActivate: [roleGuard('Admin')] },
  // future: { path: 'admin/bins',  component: BinComponent,  canActivate: [roleGuard('Admin')] },

  // ── Procurement Officer ───────────────────────────────
  { path: 'procurement', component: ProcurementDashboard, canActivate: [roleGuard('Procurement Officer')] },
  // future: { path: 'procurement/purchase-orders', ... }
  // future: { path: 'procurement/vendors', ... }
  // future: { path: 'procurement/goods-receipt', ... }

  // ── Inventory Controller ──────────────────────────────
  { path: 'inventory', component: InventoryDashboard, canActivate: [roleGuard('Inventory Controller')] },
  // future: { path: 'inventory/stock', ... }
  // future: { path: 'inventory/transfer-orders', ... }
  // future: { path: 'inventory/stock-adjustment', ... }
  // future: { path: 'inventory/stock-count', ... }

  // ── Quality Officer ───────────────────────────────────
  { path: 'quality', component: QualityDashboard, canActivate: [roleGuard('Quality Officer')] },
  // future: { path: 'quality/drugs', ... }
  // future: { path: 'quality/audit-logs', ... }
  // future: { path: 'quality/replenishment', ... }

  // ── Pharmacist ────────────────────────────────────────
  { path: 'pharmacist', component: PharmacistDashboard, canActivate: [roleGuard('Pharmacist')] },
  // future: { path: 'pharmacist/dispense', ... }
  // future: { path: 'pharmacist/stock-view', ... }
  // future: { path: 'pharmacist/replenishment', ... }

  // Fallback
  { path: '',   redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }

];
