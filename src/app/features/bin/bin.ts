import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BinService } from '../../core/services/bin.service';
import { LocationService } from '../../core/services/location.service';
import { LookupService } from '../../core/services/lookup.service';
import { Bin, CreateBin, BinStorageClass } from '../../core/models/bin.model';
import { Location } from '../../core/models/location.model';

type ActiveView = 'list' | 'add' | 'update';
type QuarantineFilter = 'all' | 'yes' | 'no';

interface UpdateForm {
  binId: number;
  code: string;
  locationName: string;
  binStorageClassId: number;
  isQuarantine: boolean;
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
  filterQuarantine     = signal<QuarantineFilter>('all');

  // ── Storage classes from lookup API ──────────────────
  storageClasses = signal<BinStorageClass[]>([]);

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

    const qFilter = this.filterQuarantine();
    if (qFilter === 'yes') result = result.filter(b =>  b.isQuarantine);
    if (qFilter === 'no')  result = result.filter(b => !b.isQuarantine);

    return result;
  });

  hasActiveFilters = computed(() =>
    this.searchQuery()          !== '' ||
    this.filterLocationId()     !== '' ||
    this.filterStorageClassId() !== '' ||
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
    binStorageClassId: 0, isQuarantine: false, maxCapacity: 0
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
    private locationService: LocationService,
    private lookupService: LookupService
  ) {}

  ngOnInit() {
    this.loadAll();
    this.loadLocations();
    this.loadStorageClasses();
  }

  // ── Helpers ──────────────────────────────────────────

  clearFilters() {
    this.searchQuery.set('');
    this.filterLocationId.set('');
    this.filterStorageClassId.set('');
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

  loadStorageClasses() {
    this.lookupService.getStorageClasses().subscribe({
      next: (data) => this.storageClasses.set(data.map(e => ({ id: e.id, name: e.name }))),
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
