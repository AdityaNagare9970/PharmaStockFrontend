import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { VendorService } from '../../core/services/vendor.service';
import { LocationService } from '../../core/services/location.service';
import {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  PurchaseOrderStatus,
} from '../../core/models/purchase-order.model';
import { Vendor } from '../../core/models/vendor.model';
import { Location } from '../../core/models/location.model';

@Component({
  selector: 'app-purchase-order',
  imports: [FormsModule],
  templateUrl: './purchase-order.html',
  styleUrl: './purchase-order.css',
})
export class PurchaseOrderComponent implements OnInit {
  orders   = signal<PurchaseOrder[]>([]);
  statuses = signal<PurchaseOrderStatus[]>([]);
  vendors  = signal<Vendor[]>([]);
  locations = signal<Location[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  searchVendor = signal('');

  filteredOrders = computed(() => {
    const q = this.searchVendor().trim().toLowerCase();
    if (!q) return this.orders();
    return this.orders().filter(
      (o) =>
        o.vendorName.toLowerCase().includes(q) ||
        o.purchaseOrderId.toString().includes(q)
    );
  });

  showModal = signal(false);
  isEditing = signal(false);
  editingId = signal<number | null>(null);
  isSaving = signal(false);

  showDeleteModal = signal(false);
  deletingId = signal<number | null>(null);
  isDeleting = signal(false);

  // Form fields
  formVendorId = 0;
  formLocationId = 0;
  formExpectedDate = '';
  formStatusId = 0;

  constructor(
    private poService: PurchaseOrderService,
    private vendorService: VendorService,
    private locationService: LocationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadStatuses();
    this.vendorService.getAll().subscribe({ next: (data) => this.vendors.set(data.filter(v => v.statusId)) });
    this.locationService.getAll().subscribe({ next: (data) => this.locations.set(data.filter(l => l.statusId)) });
  }

  private resetForm(): void {
    this.formVendorId     = 0;
    this.formLocationId   = 0;
    this.formExpectedDate = '';
    this.formStatusId     = 0;
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.poService.getAll().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(this.extractError(err));
        this.isLoading.set(false);
      },
    });
  }

  loadStatuses(): void {
    this.poService.getStatuses().subscribe({
      next: (data) => this.statuses.set(data),
      error: () => {},
    });
  }

  clearSearch(): void {
    this.searchVendor.set('');
  }

  getVendorName(id: number): string {
    return this.vendors().find(v => v.vendorId === id)?.name ?? `Vendor #${id}`;
  }

  getLocationName(id: number): string {
    return this.locations().find(l => l.locationId === id)?.name ?? `Location #${id}`;
  }

  openAdd(): void {
    this.resetForm();
    this.isEditing.set(false);
    this.editingId.set(null);
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  openEdit(order: PurchaseOrder): void {
    this.formVendorId     = order.vendorId;
    this.formLocationId   = order.locationId;
    this.formExpectedDate = order.expectedDate;
    this.formStatusId     = order.purchaseOrderStatusId;
    this.isEditing.set(true);
    this.editingId.set(order.purchaseOrderId);
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveOrder(): void {
    if (!this.formExpectedDate) return;

    this.isSaving.set(true);
    const isEdit = this.isEditing();

    if (isEdit) {
      const payload: UpdatePurchaseOrderRequest = {
        expectedDate:          this.formExpectedDate,
        purchaseOrderStatusId: Number(this.formStatusId),
      };
      this.poService.update(this.editingId()!, payload).subscribe({
        next: () => this.onSaveSuccess(true),
        error: (err) => this.onSaveError(err),
      });
    } else {
      const payload: CreatePurchaseOrderRequest = {
        vendorId:     Number(this.formVendorId),
        locationId:   Number(this.formLocationId),
        expectedDate: this.formExpectedDate,
      };
      this.poService.create(payload).subscribe({
        next: () => this.onSaveSuccess(false),
        error: (err) => this.onSaveError(err),
      });
    }
  }

  private onSaveSuccess(isEdit: boolean): void {
    this.isSaving.set(false);
    this.showModal.set(false);
    this.showSuccess(isEdit ? 'Purchase order updated.' : 'Purchase order created.');
    this.loadOrders();
  }

  private onSaveError(err: any): void {
    this.isSaving.set(false);
    this.errorMessage.set(this.extractError(err));
  }

  confirmDelete(id: number): void {
    this.deletingId.set(id);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.deletingId.set(null);
  }

  deleteOrder(): void {
    this.isDeleting.set(true);
    this.poService.delete(this.deletingId()!).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.showSuccess('Purchase order deleted.');
        this.loadOrders();
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.errorMessage.set(this.extractError(err));
      },
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    // Handle DateOnly coming as "YYYY-MM-DD" string
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length < 3) return dateStr;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  isDue(expectedDate: string, status: string): boolean {
    if (!expectedDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expectedDate.split('T')[0]);
    const st = (status || '').toLowerCase();
    return exp <= today && st !== 'closed' && st !== 'rejected';
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

  private extractError(err: any): string {
    return (
      err.error?.message ||
      err.error?.title ||
      (typeof err.error === 'string' ? err.error : null) ||
      `Error ${err.status}: ${err.statusText}`
    );
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
