import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PurchaseItemService } from '../../core/services/purchase-item.service';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { ItemService } from '../../core/services/item.service';
import { PurchaseItem, CreatePurchaseItemRequest, UpdatePurchaseItemRequest } from '../../core/models/purchase-item.model';
import { PurchaseOrder } from '../../core/models/purchase-order.model';
import { Item } from '../../core/models/item.model';

@Component({
  selector: 'app-purchase-item',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './purchase-item.html',
  styleUrl: './purchase-item.css',
})
export class PurchaseItemComponent implements OnInit {
  items         = signal<PurchaseItem[]>([]);
  purchaseOrders = signal<PurchaseOrder[]>([]);
  stockItems    = signal<Item[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  searchPoId = signal('');

  filteredItems = computed(() => {
    const q = this.searchPoId().trim();
    if (!q) return this.items();
    return this.items().filter((i) =>
      i.purchaseOrderId.toString().includes(q)
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
  formPurchaseOrderId = 0;
  formItemId = 0;
  formOrderedQty = 1;
  formUnitPrice = 0;
  formTaxPct = 0;

  constructor(
    private piService: PurchaseItemService,
    private poService: PurchaseOrderService,
    private itemService: ItemService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadItems();
    this.poService.getAll().subscribe({ next: (data) => this.purchaseOrders.set(data) });
    this.itemService.getAll().subscribe({ next: (data) => this.stockItems.set(data) });
  }

  getPoLabel(id: number): string {
    const po = this.purchaseOrders().find(p => p.purchaseOrderId === id);
    return po ? `PO-${po.purchaseOrderId} (${po.vendorName})` : `PO-${id}`;
  }

  getItemLabel(id: number): string {
    const item = this.stockItems().find(i => i.itemId === id);
    if (!item) return `Item #${id}`;
    const pack = item.packSize ? `Pack of ${item.packSize}` : item.uoMCode;
    return `${item.drugName} — ${pack}`;
  }

  private resetForm(): void {
    this.formPurchaseOrderId = 0;
    this.formItemId = 0;
    this.formOrderedQty = 1;
    this.formUnitPrice = 0;
    this.formTaxPct = 0;
  }

  private buildCreateRequest(): CreatePurchaseItemRequest {
    return {
      purchaseOrderId: Number(this.formPurchaseOrderId),
      itemId: Number(this.formItemId),
      orderedQty: Number(this.formOrderedQty),
      unitPrice: Number(this.formUnitPrice),
      taxPct: Number(this.formTaxPct),
    };
  }

  private buildUpdateRequest(): UpdatePurchaseItemRequest {
    return {
      orderedQty: Number(this.formOrderedQty),
      unitPrice: Number(this.formUnitPrice),
      taxPct: Number(this.formTaxPct),
    };
  }

  loadItems(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.piService.getAll().subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(this.extractError(err));
        this.isLoading.set(false);
      },
    });
  }

  clearSearch(): void {
    this.searchPoId.set('');
  }

  openAdd(): void {
    this.resetForm();
    this.isEditing.set(false);
    this.editingId.set(null);
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  openEdit(item: PurchaseItem): void {
    this.formPurchaseOrderId = item.purchaseOrderId;
    this.formItemId          = item.itemId;
    this.formOrderedQty      = item.orderedQty;
    this.formUnitPrice       = Number(item.unitPrice);
    this.formTaxPct          = Number(item.taxPct);
    this.isEditing.set(true);
    this.editingId.set(item.purchaseItemId);
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveItem(): void {
    if (!this.formOrderedQty || this.formOrderedQty < 1) return;

    this.isSaving.set(true);
    const isEdit = this.isEditing();

    const action = isEdit
      ? this.piService.update(this.editingId()!, this.buildUpdateRequest())
      : this.piService.create(this.buildCreateRequest());

    action.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showModal.set(false);
        this.showSuccess(isEdit ? 'Purchase item updated.' : 'Purchase item added.');
        this.loadItems();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(this.extractError(err));
      },
    });
  }

  confirmDelete(id: number): void {
    this.deletingId.set(id);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.deletingId.set(null);
  }

  deleteItem(): void {
    this.isDeleting.set(true);
    this.piService.delete(this.deletingId()!).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.showSuccess('Purchase item deleted.');
        this.loadItems();
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.errorMessage.set(this.extractError(err));
      },
    });
  }

  calcTotal(item: PurchaseItem): number {
    const base = Number(item.unitPrice) * item.orderedQty;
    return base + base * (Number(item.taxPct) / 100);
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
