import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { VendorService } from '../../core/services/vendor.service';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { PurchaseItemService } from '../../core/services/purchase-item.service';
import { PurchaseOrder } from '../../core/models/purchase-order.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  isLoading = signal(true);

  totalVendors   = signal(0);
  activeVendors  = signal(0);
  totalPOs       = signal(0);
  openPOs        = signal(0);
  dueReceipts    = signal(0);
  totalItems     = signal(0);
  totalItemValue = signal(0);

  recentOrders = signal<PurchaseOrder[]>([]);

  constructor(
    private vendorService: VendorService,
    private poService: PurchaseOrderService,
    private piService: PurchaseItemService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    forkJoin({
      vendors: this.vendorService.getAll(),
      orders:  this.poService.getAll(),
      items:   this.piService.getAll(),
    }).subscribe({
      next: ({ vendors, orders, items }) => {
        // Vendor stats
        this.totalVendors.set(vendors.length);
        this.activeVendors.set(vendors.filter(v => v.statusId).length);

        // PO stats
        this.totalPOs.set(orders.length);
        const openStatuses = ['draft', 'pending', 'approved', 'partiallyreceived'];
        this.openPOs.set(
          orders.filter(o => openStatuses.includes((o.status || '').toLowerCase())).length
        );

        // Due receipts: expected date today or past + not closed/rejected
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.dueReceipts.set(
          orders.filter(o => {
            const exp = new Date(o.expectedDate.split('T')[0]);
            const st  = (o.status || '').toLowerCase();
            return exp <= today && st !== 'closed' && st !== 'rejected';
          }).length
        );

        // Purchase item stats
        this.totalItems.set(items.length);
        this.totalItemValue.set(
          items.reduce((sum, i) => sum + Number(i.totalAmount ?? 0), 0)
        );

        // 5 most recent open POs
        const open = orders
          .filter(o => openStatuses.includes((o.status || '').toLowerCase()))
          .sort((a, b) => b.purchaseOrderId - a.purchaseOrderId)
          .slice(0, 5);
        this.recentOrders.set(open);

        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length < 3) return dateStr;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  statusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'draft':             return 'badge-draft';
      case 'pending':           return 'badge-pending';
      case 'approved':          return 'badge-approved';
      case 'partiallyreceived': return 'badge-partial';
      case 'closed':            return 'badge-closed';
      default:                  return 'badge-draft';
    }
  }

  formatCurrency(val: number): string {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
