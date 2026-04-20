import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ItemService } from '../../core/services/item.service';
import { DrugService } from '../../core/services/drug.service';
import { Item, CreateItem } from '../../core/models/item.model';
import { Drug } from '../../core/models/drug.model';

type ActiveView = 'list' | 'add' | 'update';
type StatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-item',
  imports: [FormsModule],
  templateUrl: './item.html',
  styleUrl: './item.css'
})
export class ItemComponent implements OnInit {

  activeView = signal<ActiveView>('list');
  items      = signal<Item[]>([]);
  drugs      = signal<Drug[]>([]);

  // ── Filter signals ────────────────────────────────────
  searchQuery   = signal('');
  filterDrugId  = signal<number | ''>('');
  filterStatus  = signal<StatusFilter>('all');

  // ── Filtered result ───────────────────────────────────
  filteredItems = computed(() => {
    let result = this.items();

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      result = result.filter(i =>
        i.barcode.toLowerCase().includes(q) ||
        i.itemId.toString() === q ||
        this.getDrugName(i.drugId).toLowerCase().includes(q)
      );
    }

    const drugId = this.filterDrugId();
    if (drugId !== '') result = result.filter(i => i.drugId === drugId);

    const status = this.filterStatus();
    if (status === 'active')   result = result.filter(i =>  i.status);
    if (status === 'inactive') result = result.filter(i => !i.status);

    return result;
  });

  hasActiveFilters = computed(() =>
    this.searchQuery()  !== '' ||
    this.filterDrugId() !== '' ||
    this.filterStatus() !== 'all'
  );

  // ── Add form ──────────────────────────────────────────
  newItem: CreateItem = {
    drugId: 0, packSize: null, uoM: 0,
    conversionToEach: 1, barcode: '', status: true
  };

  // ── Update form ───────────────────────────────────────
  updateData: Item = {
    itemId: 0, drugId: 0, packSize: null, uoM: 0,
    conversionToEach: 1, barcode: '', status: true
  };

  // ── Delete confirmation ───────────────────────────────
  pendingDelete = signal<Item | null>(null);

  // ── Feedback ──────────────────────────────────────────
  successMessage = signal('');
  errorMessage   = signal('');
  isLoading      = signal(false);
  isDeleting     = signal(false);

  constructor(
    private itemService: ItemService,
    private drugService: DrugService
  ) {}

  ngOnInit() {
    this.loadAll();
    this.loadDrugs();
  }

  // ── Helpers ──────────────────────────────────────────

  getDrugName(drugId: number): string {
    const drug = this.drugs().find(d => d.drugId === drugId);
    return drug ? `${drug.genericName} ${drug.strength}` : `Drug ${drugId}`;
  }

  clearFilters() {
    this.searchQuery.set('');
    this.filterDrugId.set('');
    this.filterStatus.set('all');
  }

  clearMessages() {
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  setView(view: ActiveView) {
    this.activeView.set(view);
    this.clearMessages();
  }

  // ── Load All ─────────────────────────────────────────

  loadAll() {
    this.isLoading.set(true);
    this.clearMessages();
    this.itemService.getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next:  (data) => this.items.set(data),
        error: (err)  => this.errorMessage.set(err.error?.message ?? 'Failed to fetch items.')
      });
  }

  loadDrugs() {
    this.drugService.getAll().subscribe({
      next:  (data) => this.drugs.set(data),
      error: () => {}
    });
  }

  // ── Add ──────────────────────────────────────────────

  addItem() {
    if (!this.newItem.drugId)              { this.errorMessage.set('Drug is required.'); return; }
    if (!this.newItem.uoM)                 { this.errorMessage.set('Unit of measure is required.'); return; }
    if (!this.newItem.barcode.trim())      { this.errorMessage.set('Barcode is required.'); return; }
    if (this.newItem.conversionToEach <= 0) { this.errorMessage.set('Conversion to each must be greater than 0.'); return; }

    this.isLoading.set(true);
    this.clearMessages();
    this.itemService.create(this.newItem)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.successMessage.set(res.message || 'Item created successfully!');
          this.newItem = { drugId: 0, packSize: null, uoM: 0, conversionToEach: 1, barcode: '', status: true };
          this.loadAll();
          this.setView('list');
        },
        error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to create item.')
      });
  }

  // ── Inline Update ────────────────────────────────────

  openUpdate(item: Item) {
    this.updateData = { ...item };
    this.setView('update');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateItem() {
    if (!this.updateData.drugId)               { this.errorMessage.set('Drug is required.'); return; }
    if (!this.updateData.uoM)                  { this.errorMessage.set('Unit of measure is required.'); return; }
    if (!this.updateData.barcode.trim())       { this.errorMessage.set('Barcode is required.'); return; }
    if (this.updateData.conversionToEach <= 0) { this.errorMessage.set('Conversion to each must be greater than 0.'); return; }

    this.isLoading.set(true);
    this.clearMessages();
    const { itemId, ...payload } = this.updateData;
    this.itemService.update(itemId, payload)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.successMessage.set(res.message || 'Item updated successfully!');
          this.loadAll();
          this.setView('list');
        },
        error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to update item.')
      });
  }

  // ── Delete with Confirmation ──────────────────────────

  confirmDelete(item: Item) {
    this.pendingDelete.set(item);
    this.clearMessages();
  }

  cancelDelete() {
    this.pendingDelete.set(null);
  }

  executeDelete() {
    const item = this.pendingDelete();
    if (!item) return;
    this.isDeleting.set(true);
    this.itemService.delete(item.itemId)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: (res) => {
          this.pendingDelete.set(null);
          this.successMessage.set(res.message || `Item "${item.barcode}" deleted successfully.`);
          this.loadAll();
        },
        error: (err) => {
          this.pendingDelete.set(null);
          this.errorMessage.set(err.error?.message ?? `Cannot delete item "${item.barcode}".`);
        }
      });
  }
}
