import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { DrugService } from '../../core/services/drug.service';
import { Drug, CreateDrug } from '../../core/models/drug.model';

type ActiveView = 'list' | 'add' | 'update';
type StatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-drug',
  imports: [FormsModule],
  templateUrl: './drug.html',
  styleUrl: './drug.css'
})
export class DrugComponent implements OnInit {

  activeView = signal<ActiveView>('list');
  drugs      = signal<Drug[]>([]);

  // ── Filter signals ────────────────────────────────────
  searchQuery      = signal('');
  filterForm       = signal<number | ''>('');
  filterControl    = signal<number | ''>('');
  filterStorage    = signal<number | ''>('');
  filterStatus     = signal<StatusFilter>('all');

  // ── Derived: unique lookup values from loaded drugs ───
  uniqueForms = computed(() => {
    const seen = new Set<number>();
    return this.drugs().filter(d => { const ok = !seen.has(d.form); seen.add(d.form); return ok; })
      .map(d => d.form).sort((a, b) => a - b);
  });

  uniqueControlClasses = computed(() => {
    const seen = new Set<number>();
    return this.drugs().filter(d => { const ok = !seen.has(d.controlClass); seen.add(d.controlClass); return ok; })
      .map(d => d.controlClass).sort((a, b) => a - b);
  });

  uniqueStorageClasses = computed(() => {
    const seen = new Set<number>();
    return this.drugs().filter(d => { const ok = !seen.has(d.storageClass); seen.add(d.storageClass); return ok; })
      .map(d => d.storageClass).sort((a, b) => a - b);
  });

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

    const status = this.filterStatus();
    if (status === 'active')   result = result.filter(d =>  d.status);
    if (status === 'inactive') result = result.filter(d => !d.status);

    return result;
  });

  hasActiveFilters = computed(() =>
    this.searchQuery()   !== '' ||
    this.filterForm()    !== '' ||
    this.filterControl() !== '' ||
    this.filterStorage() !== '' ||
    this.filterStatus()  !== 'all'
  );

  // ── Add form ──────────────────────────────────────────
  newDrug: CreateDrug = {
    genericName: '', brandName: '', strength: '',
    form: 0, atccode: '', controlClass: 0, storageClass: 0, status: true
  };

  // ── Update form ───────────────────────────────────────
  updateData: Drug = {
    drugId: 0, genericName: '', brandName: '', strength: '',
    form: 0, atccode: '', controlClass: 0, storageClass: 0, status: true
  };

  // ── Delete confirmation ───────────────────────────────
  pendingDelete = signal<Drug | null>(null);

  // ── Feedback ──────────────────────────────────────────
  successMessage = signal('');
  errorMessage   = signal('');
  isLoading      = signal(false);
  isDeleting     = signal(false);

  constructor(private drugService: DrugService) {}

  ngOnInit() {
    this.loadAll();
  }

  // ── Helpers ──────────────────────────────────────────

  clearFilters() {
    this.searchQuery.set('');
    this.filterForm.set('');
    this.filterControl.set('');
    this.filterStorage.set('');
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
          this.newDrug = { genericName: '', brandName: '', strength: '', form: 0, atccode: '', controlClass: 0, storageClass: 0, status: true };
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
