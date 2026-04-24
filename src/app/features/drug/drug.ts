import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { DrugService } from '../../core/services/drug.service';
import { LookupService, LookupEntry } from '../../core/services/lookup.service';
import { Drug, CreateDrug } from '../../core/models/drug.model';

type ActiveView = 'list' | 'add' | 'update';

@Component({
  selector: 'app-drug',
  imports: [FormsModule],
  templateUrl: './drug.html',
  styleUrl: './drug.css'
})
export class DrugComponent implements OnInit {

  activeView = signal<ActiveView>('list');
  drugs      = signal<Drug[]>([]);

  // ── Lookup signals ────────────────────────────────────
  drugForms      = signal<LookupEntry[]>([]);
  controlClasses = signal<LookupEntry[]>([]);
  storageClasses = signal<LookupEntry[]>([]);

  // ── Filter signals ────────────────────────────────────
  searchQuery      = signal('');
  filterForm       = signal<number | ''>('');
  filterControl    = signal<number | ''>('');
  filterStorage    = signal<number | ''>('');

  // ── Filtered result ───────────────────────────────────
  filteredDrugs = computed(() => {
    let result = this.drugs();

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      result = result.filter(d =>
        d.genericName.toLowerCase().includes(q) ||
        (d.brandName ?? '').toLowerCase().includes(q) ||
        d.drugId.toString() === q
      );
    }

    const form = this.filterForm();
    if (form !== '') result = result.filter(d => d.form === form);

    const ctrl = this.filterControl();
    if (ctrl !== '') result = result.filter(d => d.controlClass === ctrl);

    const stor = this.filterStorage();
    if (stor !== '') result = result.filter(d => d.storageClass === stor);

    return result;
  });

  hasActiveFilters = computed(() =>
    this.searchQuery()   !== '' ||
    this.filterForm()    !== '' ||
    this.filterControl() !== '' ||
    this.filterStorage() !== ''
  );

  // ── Add form ──────────────────────────────────────────
  newDrug: CreateDrug = {
    genericName: '', brandName: '', strength: '',
    form: 0, atccode: '', controlClass: 0, storageClass: 0
  };

  // ── Update form ───────────────────────────────────────
  updateData: Drug = {
    drugId: 0, genericName: '', brandName: '', strength: '',
    form: 0, atccode: '', controlClass: 0, storageClass: 0
  };

  // ── Delete confirmation ───────────────────────────────
  pendingDelete = signal<Drug | null>(null);

  // ── Feedback ──────────────────────────────────────────
  successMessage = signal('');
  errorMessage   = signal('');
  isLoading      = signal(false);
  isDeleting     = signal(false);

  constructor(
    private drugService: DrugService,
    private lookupService: LookupService
  ) {}

  ngOnInit() {
    this.loadAll();
    this.loadLookups();
  }

  // ── Helpers ──────────────────────────────────────────

  getFormName(id: number): string {
    return this.drugForms().find(e => e.id === id)?.name ?? `Form ${id}`;
  }

  getControlClassName(id: number): string {
    return this.controlClasses().find(e => e.id === id)?.name ?? `Class ${id}`;
  }

  getStorageClassName(id: number): string {
    return this.storageClasses().find(e => e.id === id)?.name ?? `Class ${id}`;
  }

  clearFilters() {
    this.searchQuery.set('');
    this.filterForm.set('');
    this.filterControl.set('');
    this.filterStorage.set('');
  }

  clearMessages() {
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  setView(view: ActiveView) {
    this.activeView.set(view);
    this.clearMessages();
  }

  // ── Load Lookups ─────────────────────────────────────

  loadLookups() {
    this.lookupService.getDrugForms().subscribe({
      next: (data) => this.drugForms.set(data),
      error: () => this.errorMessage.set('Failed to load drug forms.')
    });
    this.lookupService.getControlClasses().subscribe({
      next: (data) => this.controlClasses.set(data),
      error: () => this.errorMessage.set('Failed to load control classes.')
    });
    this.lookupService.getDrugStorageClasses().subscribe({
      next: (data) => this.storageClasses.set(data),
      error: () => this.errorMessage.set('Failed to load storage classes.')
    });
  }

  // ── Load All ─────────────────────────────────────────

  loadAll() {
    this.isLoading.set(true);
    this.clearMessages();
    this.drugService.getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next:  (data) => this.drugs.set(data),
        error: (err)  => this.errorMessage.set(err.error?.message ?? 'Failed to fetch drugs.')
      });
  }

  // ── Add ──────────────────────────────────────────────

  addDrug() {
    if (!this.newDrug.genericName.trim()) { this.errorMessage.set('Generic name is required.'); return; }
    if (!this.newDrug.strength.trim())    { this.errorMessage.set('Strength is required.'); return; }
    if (!this.newDrug.form)               { this.errorMessage.set('Form is required.'); return; }
    if (!this.newDrug.controlClass)       { this.errorMessage.set('Control class is required.'); return; }
    if (!this.newDrug.storageClass)       { this.errorMessage.set('Storage class is required.'); return; }

    this.isLoading.set(true);
    this.clearMessages();
    this.drugService.create(this.newDrug)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Drug created successfully!');
          this.newDrug = { genericName: '', brandName: '', strength: '', form: 0, atccode: '', controlClass: 0, storageClass: 0 };
          this.loadAll();
          this.setView('list');
        },
        error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to create drug.')
      });
  }

  // ── Inline Update ────────────────────────────────────

  openUpdate(drug: Drug) {
    this.updateData = { ...drug };
    this.setView('update');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateDrug() {
    if (!this.updateData.genericName.trim()) { this.errorMessage.set('Generic name is required.'); return; }
    if (!this.updateData.strength.trim())    { this.errorMessage.set('Strength is required.'); return; }
    if (!this.updateData.form)               { this.errorMessage.set('Form is required.'); return; }
    if (!this.updateData.controlClass)       { this.errorMessage.set('Control class is required.'); return; }
    if (!this.updateData.storageClass)       { this.errorMessage.set('Storage class is required.'); return; }

    this.isLoading.set(true);
    this.clearMessages();
    const { drugId, ...payload } = this.updateData;
    this.drugService.update(drugId, payload)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.successMessage.set(res.message || 'Drug updated successfully!');
          this.loadAll();
          this.setView('list');
        },
        error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to update drug.')
      });
  }

  // ── Delete with Confirmation ──────────────────────────

  confirmDelete(drug: Drug) {
    this.pendingDelete.set(drug);
    this.clearMessages();
  }

  cancelDelete() {
    this.pendingDelete.set(null);
  }

  executeDelete() {
    const drug = this.pendingDelete();
    if (!drug) return;
    this.isDeleting.set(true);
    this.drugService.delete(drug.drugId)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: (res) => {
          this.pendingDelete.set(null);
          this.successMessage.set(res.message || `"${drug.genericName}" deleted successfully.`);
          this.loadAll();
        },
        error: (err) => {
          this.pendingDelete.set(null);
          this.errorMessage.set(err.error?.message ?? `Cannot delete "${drug.genericName}".`);
        }
      });
  }
}
