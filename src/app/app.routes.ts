import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { VendorComponent } from './features/vendor/vendor';
import { PurchaseOrderComponent } from './features/purchase-order/purchase-order';
import { PurchaseItemComponent } from './features/purchase-item/purchase-item';

import { AdminLayout } from './features/admin/admin-layout';
import { AdminDashboard } from './features/admin/admin-dashboard';
import { ProcurementLayoutComponent } from './features/procurement/procurement-layout/procurement-layout';
import { QualityLayoutComponent } from './features/quality/quality-layout/quality-layout';
import { QualityDashboardNewComponent } from './features/quality/dashboard/quality-dashboard-new';
import { QuarantineComponent } from './features/quality/quarantine/quarantine';

import { IcLayoutComponent } from './features/inventory-controller/ic-layout/ic-layout';
import { IcDashboardComponent } from './features/inventory-controller/dashboard/ic-dashboard';
import { InventoryLotsComponent } from './features/inventory-controller/inventory-lots/inventory-lots';
import { TransferOrdersComponent } from './features/inventory-controller/transfer-orders/transfer-orders';
import { ReplenishmentComponent } from './features/inventory-controller/replenishment/replenishment';
import { StockBalanceComponent } from './features/inventory-controller/stock-balance/stock-balance';

import { PharmacistLayoutComponent } from './features/pharmacist/pharmacist-layout/pharmacist-layout';
import { PharmacistDashboardComponent } from './features/pharmacist/dashboard/pharmacist-dashboard';
import { PharmacistStockComponent } from './features/pharmacist/stock/pharmacist-stock';
import { IncomingTransfersComponent } from './features/pharmacist/transfers/incoming-transfers';
import { PharmacistDispenseComponent } from './features/pharmacist/dispense/pharmacist-dispense';
import { GrnComponent } from './features/pharmacist/grn/grn';

import { LocationComponent } from './features/location/location';
import { UserComponent } from './features/user/user';
import { BinComponent } from './features/bin/bin';
import { DrugComponent } from './features/drug/drug';
import { ItemComponent } from './features/item/item';
import { AuditComponent } from './features/audit/audit';
import { ReplenishmentRulesComponent } from './features/admin/replenishment-rules/replenishment-rules';

import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  // Auth
  { path: 'auth/login', component: Login },

  // ── Admin (sidebar layout with nested children) ────────
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [roleGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '',          component: AdminDashboard   },
      { path: 'locations', component: LocationComponent },
      { path: 'users',     component: UserComponent     },
      { path: 'bins',      component: BinComponent      },
      { path: 'drugs',     component: DrugComponent     },
      { path: 'items',     component: ItemComponent     },
      { path: 'audit',                component: AuditComponent              },
      { path: 'replenishment-rules',  component: ReplenishmentRulesComponent },
    ]
  },

  // ── Procurement Officer ───────────────────────────────
  {
    path: 'procurement',
    component: ProcurementLayoutComponent,
    canActivate: [roleGuard],
    data: { roles: ['procurementofficer'] },
    children: [
      { path: '',                redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',       component: Dashboard                        },
      { path: 'vendors',         component: VendorComponent                  },
      { path: 'purchase-orders', component: PurchaseOrderComponent           },
      { path: 'goods-receipt',   component: PurchaseItemComponent            },
    ]
  },

  // ── Inventory Controller ──────────────────────────────
  {
    path: 'ic',
    component: IcLayoutComponent,
    canActivate: [roleGuard],
    data: { roles: ['inventorycontroller'] },
    children: [
      { path: '',               redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',      component: IcDashboardComponent      },
      { path: 'inventory-lots',  component: InventoryLotsComponent    },
      { path: 'stock-balance',   component: StockBalanceComponent     },
      { path: 'transfer-orders',component: TransferOrdersComponent   },
      { path: 'replenishment',  component: ReplenishmentComponent    },
    ]
  },

  // ── Quality Officer ───────────────────────────────────
  {
    path: 'quality',
    component: QualityLayoutComponent,
    canActivate: [roleGuard],
    data: { roles: ['qualitycomplianceofficer'] },
    children: [
      { path: '',            redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',   component: QualityDashboardNewComponent  },
      { path: 'quarantine',  component: QuarantineComponent           },
      { path: 'audit',       component: AuditComponent                },
    ]
  },

  // ── Pharmacist ────────────────────────────────────────
  {
    path: 'pharmacist',
    component: PharmacistLayoutComponent,
    canActivate: [roleGuard],
    data: { roles: ['pharmacist'] },
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PharmacistDashboardComponent },
      { path: 'stock',     component: PharmacistStockComponent     },
      { path: 'transfers', component: IncomingTransfersComponent   },
      { path: 'dispense',  component: PharmacistDispenseComponent  },
      { path: 'grn',       component: GrnComponent                 },
    ]
  },

  // Fallback
  { path: '',   redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }

];
