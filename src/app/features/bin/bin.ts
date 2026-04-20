import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BinService } from '../../core/services/bin.service';
import { LocationService } from '../../core/services/location.service';
import { Bin, CreateBin, BinStorageClass } from '../../core/models/bin.model';
import { Location } from '../../core/models/location.model';

type ActiveView = 'list' | 'add' | 'update';
type StatusFilter = 'all' | 'active' | 'inactive';
type QuarantineFilter = 'all' | 'yes' | 'no';

interface UpdateForm {
  binId: number;
  code: string;
  locationName: string;
  binStorageClassId: number;
  isQuarantine: boolean;
  isActive: boolean;
  maxCapacity: number;
}

@Component({
  selector: 'app-bin',
  imports: [FormsModule],
  templateUrl: './bin.html',
  styleUrl: './bin.css'
})
export class BinComponent implements OnInit {

  activeView = signal<ActiveView>('list');
  bins       = signal<Bin[]>([]);
  locations  = signal<Location[]>([]);

  // ── Filter signals ────────────────────────────────────
  searchQuery          = signal('');
  filterLocationId     = signal<number | ''>('');
  filterStorageClassId = signal<number | ''>('');
  filterStatus         = signal<StatusFilter>('all');
  filterQuarantine     = signal<QuarantineFilter>('all');

  // ── Derived: unique storage classes from loaded bins ──
  storageClasses = computed<BinStorageClass[]>(() => {
    const seen = new Map<number, string>();
    for (const b of this.bins()) {
      if (!seen.has(b.binStorageClassId)) seen.set(b.binStorageClassId, b.storageClass);
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  });

  // ── Active locations for create form ──────────────────
  activeLocations = computed(() => this.locations().filter(l => l.statusId));

  // ── Filtered result ───────────────────────────────────
  filteredBins = computed(() => {
    let result = this.bins();

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      result = result.filter(b =>
        b.code.toLowerCase().includes(q) ||
        b.locationName.toLowerCase().includes(q) ||
        b.binId.toString() === q
      );
    }

    const locId = this.filterLocationId();
    if (locId !== '') result = result.filter(b => b.locationId === locId);

    const scId = this.filterStorageClassId();
    if (scId !== '') result = result.filter(b => b.binStorageClassId === scId);

    const status = this.filterStatus();
    if (status === 'active')   result = result.filter(b =>  b.isActive);
    if (status === 'inactive') result = result.filter(b => !b.isActive);

    const qFilter = this.filterQuarantine();
    if (qFilter === 'yes') result = result.filter(b =>  b.isQuarantine);
    if (qFilter === 'no')  result = result.filter(b => !b.isQuarantine);

    return result;
  });

  hasActiveFilters = computed(() =>
    this.searchQuery()          !== '' ||
    this.filterLocationId()     !== '' ||
    this.filterStorageClassId() !== '' ||
    this.filterStatus()         !== 'all' ||
    this.filterQuarantine()     !== 'all'
  );

  // ── Add form ──────────────────────────────────────────
  newBin: CreateBin = {
    locationId: 0, code: '', binStorageClassId: 0,
    isQuarantine: false, maxCapacity: 0
  };

  // ── Update form (pre-filled from row click) ───────────
  updateData: UpdateForm = {
    binId: 0, code: '', locationName: '',
    binStorageClassId: 0, isQuarantine: false,
    isActive: true, maxCapacity: 0
  };

  // ── Delete confirmation ───────────────────────────────
  pendingDelete = signal<Bin | null>(null);

  // ── Feedback ──────────────────────────────────────────
  successMessage = signal('');
  errorMessage   = signal('');
  isLoading      = signal(false);
  isDeleting     = signal(false);

  constructor(
    private binService: BinService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.loadAll();
    this.loadLocations();
  }

  // ── Helpers ──────────────────────────────────────────

  clearFilters() {
    this.searchQuery.set('');
    this.filterLocationId.set('');
    this.filterStorageClassId.set('');
    this.filterStatus.set('all');
    this.filterQuarantine.set('all');
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
    this.binService.getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next:  (data) => this.bins.set(data),
        error: (err)  => this.errorMessage.set(err.error?.message ?? 'Failed to fetch bins.')
      });
  }

  loadLocations() {
    this.locationService.getAll().subscribe({
      next:  (data) => this.locations.set(data),
      error: () => {}
    });
  }

  // ── Add ──────────────────────────────────────────────

  addBin() {
    if (!this.newBin.code.trim())       { this.errorMessage.set('Code is required.'); return; }
    if (!this.newBin.locationId)        { this.errorMessage.set('Location is required.'); return; }
    if (!this.newBin.binStorageClassId) { this.errorMessage.set('Storage class is required.'); return; }
    if (this.newBin.maxCapacity <= 0)   { this.errorMessage.set('Max capacity must be greater than 0.'); return; }

    this.isLoading.set(true);
    this.clearMessages();
    this.binService.create(this.newBin)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Bin created successfully!');
          this.newBin = { locationId: 0, code: '', binStorageClassId: 0, isQuarantine: false, maxCapacity: 0 };
          this.loadAll();
          this.setView('list');
        },
        error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to create bin.')
      });
  }

  // ── Inline Update ────────────────────────────────────

  openUpdate(bin: Bin) {
    this.updateData = {
      binId:             bin.binId,
      code:              bin.code,
      locationName:      bin.locationName,
      binStorageClassId: bin.binStorageClassId,
      isQuarantine:      bin.isQuarantine,
      isActive:          bin.isActive,
      maxCapacity:       bin.maxCapacity
    };
    this.setView('update');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateBin() {
    if (!this.updateData.binStorageClassId) { this.errorMessage.set('Storage class is required.'); return; }
    if (this.updateData.maxCapacity <= 0)   { this.errorMessage.set('Max capacity must be greater than 0.'); return; }

    this.isLoading.set(true);
    this.clearMessages();
    this.binService.update(this.updateData.binId, {
      binStorageClassId: this.updateData.binStorageClassId,
      isQuarantine:      this.updateData.isQuarantine,
      isActive:          this.updateData.isActive,
      maxCapacity:       this.updateData.maxCapacity
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Bin updated successfully!');
          this.loadAll();
          this.setView('list');
        },
        error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to update bin.')
      });
  }

  // ── Delete with Confirmation ──────────────────────────

  confirmDelete(bin: Bin) {
    this.pendingDelete.set(bin);
    this.clearMessages();
  }

  cancelDelete() {
    this.pendingDelete.set(null);
  }

  executeDelete() {
    const bin = this.pendingDelete();
    if (!bin) return;
    this.isDeleting.set(true);
    this.binService.delete(bin.binId)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          this.pendingDelete.set(null);
          this.successMessage.set(`Bin "${bin.code}" was deleted successfully.`);
          this.loadAll();
        },
        error: (err) => {
          this.pendingDelete.set(null);
          this.errorMessage.set(err.error?.message ?? `Cannot delete bin "${bin.code}". It may have inventory or open tasks.`);
        }
      });
  }
}
