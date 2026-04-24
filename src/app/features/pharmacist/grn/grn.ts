import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrnService } from '../../../core/services/grn.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  PendingGrnPO, PODetails, GRN, GRNDetail,
  GrnFormItem, QcFormItem,
} from '../../../core/models/grn.model';
import { forkJoin } from 'rxjs';

type ActiveTab = 'pending' | 'qc' | 'history';

@Component({
  selector: 'app-grn',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grn.html',
})
export class GrnComponent implements OnInit {

  activeTab = signal<ActiveTab>('pending');

  // ── DATA ────────────────────────────────────────────────
  pendingPOs   = signal<PendingGrnPO[]>([]);
  pendingQcGrns = signal<GRN[]>([]);
  allGrns      = signal<GRN[]>([]);

  // ── LOADING ─────────────────────────────────────────────
  loadingPending = signal(true);
  loadingQc      = signal(true);
  loadingHistory = signal(true);

  // ── CREATE GRN STATE ────────────────────────────────────
  showCreatePanel   = signal(false);
  selectedPO        = signal<PendingGrnPO | null>(null);
  poDetails         = signal<PODetails | null>(null);
  loadingPODetails  = signal(false);
  grnFormItems      = signal<GrnFormItem[]>([]);
  formReceivedBy    = '';
  formReceivedDate  = new Date().toISOString().split('T')[0];
  savingGrn         = signal(false);
  createError       = signal('');
  createSuccess     = signal('');

  // ── QC STATE ───────────────────────────────────────────
  showQcPanel    = signal(false);
  selectedGrn    = signal<GRN | null>(null);
  grnDetail      = signal<GRNDetail | null>(null);
  loadingGrnDetail = signal(false);
  qcFormItems    = signal<QcFormItem[]>([]);
  savingQc       = signal(false);
  qcError        = signal('');
  qcSuccess      = signal('');

  // ── HISTORY VIEW STATE ──────────────────────────────────
  viewingGrn       = signal<GRNDetail | null>(null);
  showViewPanel    = signal(false);
  loadingViewDetail = signal(false);

  constructor(private grnService: GrnService, private authService: AuthService) {}

  ngOnInit() {
    this.loadAll();
    this.formReceivedBy = this.authService.getRole() ?? '';
  }

  loadAll() {
    this.loadPending();
    this.loadPendingQc();
    this.loadHistory();
  }

  loadPending() {
    this.loadingPending.set(true);
    this.grnService.getApprovedPendingGrn().subscribe({
      next: d => {
        this.pendingPOs.set(Array.isArray(d) ? d : (d as any)?.items ?? []);
        this.loadingPending.set(false);
      },
      error: () => this.loadingPending.set(false),
    });
  }

  loadPendingQc() {
    this.loadingQc.set(true);
    this.grnService.getPendingQc().subscribe({
      next: d => { this.pendingQcGrns.set(Array.isArray(d) ? d : (d as any)?.items ?? []); this.loadingQc.set(false); },
      error: () => this.loadingQc.set(false),
    });
  }

  loadHistory() {
    this.loadingHistory.set(true);
    this.grnService.getAllGrns().subscribe({
      next: d => { this.allGrns.set(d); this.loadingHistory.set(false); },
      error: () => this.loadingHistory.set(false),
    });
  }

  // ── CREATE GRN ──────────────────────────────────────────

  openCreateGrn(po: PendingGrnPO) {
    this.selectedPO.set(po);
    this.poDetails.set(null);
    this.grnFormItems.set([]);
    this.createError.set('');
    this.createSuccess.set('');
    this.formReceivedDate = new Date().toISOString().split('T')[0];
    this.loadingPODetails.set(true);
    this.showCreatePanel.set(true);

    this.grnService.getPODetails(po.purchaseOrderId).subscribe({
      next: details => {
        this.poDetails.set(details);
        this.grnFormItems.set(details.items.map(item => ({
          purchaseItemId: item.purchaseItemId,
          itemId: item.itemId,
          itemName: item.itemName,
          orderedQty: item.orderedQty,
          batchNumber: '',
          expiryDate: '',
          receivedQty: item.orderedQty,
        })));
        this.loadingPODetails.set(false);
      },
      error: () => {
        this.createError.set('Failed to load PO details.');
        this.loadingPODetails.set(false);
      },
    });
  }

  closeCreatePanel() {
    this.showCreatePanel.set(false);
    this.selectedPO.set(null);
    this.poDetails.set(null);
  }

  submitGrn() {
    this.createError.set('');
    const po = this.selectedPO();
    if (!po) return;

    if (!this.formReceivedBy.trim()) { this.createError.set('Received By is required.'); return; }
    if (!this.formReceivedDate) { this.createError.set('Received Date is required.'); return; }

    const items = this.grnFormItems();
    for (const item of items) {
      if (!item.batchNumber.trim()) { this.createError.set(`Batch number is required for ${item.itemName}.`); return; }
      if (!item.expiryDate) { this.createError.set(`Expiry date is required for ${item.itemName}.`); return; }
      if (item.receivedQty < 1) { this.createError.set(`Received quantity must be at least 1 for ${item.itemName}.`); return; }
    }

    this.savingGrn.set(true);
    this.grnService.createGrn({
      purchaseOrderId: po.purchaseOrderId,
      receivedBy: this.formReceivedBy,
      receivedDate: this.formReceivedDate,
    }).subscribe({
      next: res => {
        const grnId = res?.goodsReceiptId ?? (res as any)?.id ?? (res as any)?.grnId;
        if (!grnId) {
          this.createError.set('GRN created but could not get GRN ID for items.');
          this.savingGrn.set(false);
          return;
        }
        // Create items sequentially
        this.createGrnItemsSequentially(grnId, [...items], 0);
      },
      error: err => {
        this.createError.set(err.error?.message || err.error?.title || 'Failed to create GRN.');
        this.savingGrn.set(false);
      },
    });
  }

  private createGrnItemsSequentially(grnId: number, items: GrnFormItem[], index: number) {
    if (index >= items.length) {
      this.savingGrn.set(false);
      this.closeCreatePanel();
      this.createSuccess.set('GRN created successfully. Items ready for QC.');
      this.loadAll();
      this.activeTab.set('qc');
      setTimeout(() => this.createSuccess.set(''), 4000);
      return;
    }

    const item = items[index];
    this.grnService.createGrnItem({
      goodsReceiptId: grnId,
      purchaseItemId: item.purchaseItemId,
      itemId: item.itemId,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      receivedQty: item.receivedQty,
    }).subscribe({
      next: () => this.createGrnItemsSequentially(grnId, items, index + 1),
      error: err => {
        this.createError.set(`Failed to save item ${item.itemName}: ${err.error?.message || err.message}`);
        this.savingGrn.set(false);
      },
    });
  }

  updateGrnFormItem(index: number, field: keyof GrnFormItem, value: any) {
    const items = [...this.grnFormItems()];
    (items[index] as any)[field] = field === 'receivedQty' ? +value : value;
    this.grnFormItems.set(items);
  }

  // ── QC ──────────────────────────────────────────────────

  openQc(grn: GRN) {
    this.selectedGrn.set(grn);
    this.grnDetail.set(null);
    this.qcFormItems.set([]);
    this.qcError.set('');
    this.loadingGrnDetail.set(true);
    this.showQcPanel.set(true);

    console.log(`[QC-FE] openQc called for GRN ${grn.goodsReceiptId}`);

    this.grnService.getGrnById(grn.goodsReceiptId).subscribe({
      next: detail => {
        console.log(`[QC-FE] Raw API response for GRN ${grn.goodsReceiptId}:`, JSON.stringify(detail));

        this.grnDetail.set(detail);

        // Aggressively normalize: backend may return camelCase or PascalCase
        const rawItems: any[] =
          (Array.isArray(detail?.items) ? detail.items : null) ??
          (Array.isArray((detail as any)?.Items) ? (detail as any).Items : null) ??
          (Array.isArray((detail as any)?.goodsReceiptItems) ? (detail as any).goodsReceiptItems : null) ??
          (Array.isArray((detail as any)?.GoodsReceiptItems) ? (detail as any).GoodsReceiptItems : null) ??
          [];

        console.log(`[QC-FE] rawItems extracted (count=${rawItems.length}):`, rawItems);

        if (rawItems.length === 0) {
          this.qcError.set(
            'This GRN has no items loaded. It may have been created without items due to a previous error. ' +
            'Please check backend logs and recreate the GRN if needed.'
          );
          this.loadingGrnDetail.set(false);
          return;
        }

        const mapped = rawItems.map((item: any) => {
          const recQty = item.receivedQty ?? item.ReceivedQty ?? 0;
          return {
            goodsReceiptItemId: item.goodsReceiptItemId ?? item.GoodsReceiptItemId ?? 0,
            itemId:             item.itemId    ?? item.ItemId    ?? 0,
            itemName:           item.itemName  ?? item.ItemName  ?? 'Unknown',
            batchNumber:        item.batchNumber ?? item.BatchNumber ?? '',
            expiryDate:         item.expiryDate  ?? item.ExpiryDate  ?? '',
            receivedQty:        recQty,
            acceptedQty:        recQty,   // default: accept all, pharmacist adjusts
            rejectedQty:        0,
            rejectionReason:    '',
          };
        });

        console.log(`[QC-FE] qcFormItems mapped (count=${mapped.length}):`, mapped);

        this.qcFormItems.set(mapped);
        this.loadingGrnDetail.set(false);
      },
      error: (err) => {
        console.error('[QC-FE] Failed to load GRN detail:', err);
        this.qcError.set('Failed to load GRN details. Please try again.');
        this.loadingGrnDetail.set(false);
      },
    });
  }

  closeQcPanel() {
    this.showQcPanel.set(false);
    this.selectedGrn.set(null);
    this.grnDetail.set(null);
  }

  updateQcItem(index: number, field: keyof QcFormItem, value: any) {
    const items = [...this.qcFormItems()];
    const item = { ...items[index] };
    (item as any)[field] = (field === 'acceptedQty' || field === 'rejectedQty') ? +value : value;

    // Auto-calculate the other qty
    if (field === 'acceptedQty') {
      item.rejectedQty = Math.max(0, item.receivedQty - item.acceptedQty);
    } else if (field === 'rejectedQty') {
      item.acceptedQty = Math.max(0, item.receivedQty - item.rejectedQty);
    }

    items[index] = item;
    this.qcFormItems.set(items);
  }

  submitQc() {
    this.qcError.set('');
    const grn = this.selectedGrn();
    if (!grn) return;

    const items = this.qcFormItems();

    console.log(`[QC-FE] submitQc called — GRN ${grn.goodsReceiptId}, items count: ${items.length}`, items);

    // Guard: must have items before submitting
    if (items.length === 0) {
      this.qcError.set('No items available for QC. The GRN may have been created without items. Please reload.');
      return;
    }

    for (const item of items) {
      if (item.acceptedQty + item.rejectedQty !== item.receivedQty) {
        this.qcError.set(`${item.itemName}: Accepted + Rejected must equal Received (${item.receivedQty}).`);
        return;
      }
      if (item.rejectedQty > 0 && !item.rejectionReason.trim()) {
        this.qcError.set(`Rejection reason is required for ${item.itemName}.`);
        return;
      }
    }

    const payload = {
      items: items.map(i => ({
        grnItemId: i.goodsReceiptItemId,
        acceptedQty: i.acceptedQty,
        rejectedQty: i.rejectedQty,
        rejectionReason: i.rejectionReason,
      })),
    };

    console.log(`[QC-FE] Sending QC payload for GRN ${grn.goodsReceiptId}:`, JSON.stringify(payload));

    this.savingQc.set(true);
    this.grnService.completeQc(grn.goodsReceiptId, payload).subscribe({
      next: res => {
        console.log(`[QC-FE] QC success response:`, res);
        this.savingQc.set(false);
        this.closeQcPanel();
        this.qcSuccess.set(`QC completed. Accepted: ${res?.totalAccepted ?? '–'} units. Inventory updated.`);
        this.loadAll();
        this.activeTab.set('history');
        setTimeout(() => this.qcSuccess.set(''), 5000);
      },
      error: err => {
        console.error('[QC-FE] QC submission error:', err);
        this.qcError.set(
          err.error?.message || err.error?.errorCode || err.error?.title || 'Failed to complete QC.'
        );
        this.savingQc.set(false);
      },
    });
  }

  // ── VIEW GRN DETAIL ─────────────────────────────────────

  openViewGrn(grn: GRN) {
    this.viewingGrn.set(null);
    this.loadingViewDetail.set(true);
    this.showViewPanel.set(true);

    this.grnService.getGrnById(grn.goodsReceiptId).subscribe({
      next: d => {
        // Normalize items field name
        const normalized = {
          ...d,
          items: d.items ?? (d as any).Items ?? (d as any).goodsReceiptItems ?? (d as any).GoodsReceiptItems ?? [],
        };
        this.viewingGrn.set(normalized);
        this.loadingViewDetail.set(false);
      },
      error: () => this.loadingViewDetail.set(false),
    });
  }

  closeViewPanel() {
    this.showViewPanel.set(false);
    this.viewingGrn.set(null);
  }

  // ── HELPERS ─────────────────────────────────────────────

  statusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'created':     return 'bg-blue-100 text-blue-700';
      case 'completed':   return 'bg-green-100 text-green-700';
      case 'partiallyaccepted': return 'bg-yellow-100 text-yellow-700';
      case 'fullyrejected':    return 'bg-red-100 text-red-700';
      default:            return 'bg-gray-100 text-gray-600';
    }
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getVal(e: Event) { return (e.target as HTMLInputElement).value; }
}
