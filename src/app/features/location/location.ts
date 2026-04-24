import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../../core/services/location.service';
import { Location, CreateLocation, UpdateLocation } from '../../core/models/location.model';
import { finalize } from 'rxjs';

type ActiveView = 'list' | 'add' | 'update';
type StatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-location',
  imports: [FormsModule],
  templateUrl: './location.html',
  styleUrl: './location.css'
})
export class LocationComponent implements OnInit {

  activeView = signal<ActiveView>('list');
  locations  = signal<Location[]>([]);

  // ── Filter signals ────────────────────────────────────
  searchQuery  = signal('');
  filterType   = signal<number | ''>('');
  filterStatus = signal<StatusFilter>('all');
  filterParent = signal<number | 'none' | ''>('');

  // ── Location types loaded from API ───────────────────
  locationTypeEntries = signal<{ id: number; name: string }[]>([]);

  // ── Parent options (top-level locations only for parent select) ──
  parentOptions = computed(() =>
    this.locations().filter(l => !l.parentLocationId)
  );

  // ── Filtered result ───────────────────────────────────
  filteredLocations = computed(() => {
    let result = this.locations();

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.locationId.toString() === q
      );
    }

    const type = this.filterType();
    if (type !== '') {
      result = result.filter(l => l.locationTypeId === type);
    }

    const status = this.filterStatus();
    if (status === 'active')   result = result.filter(l =>  l.statusId);
    if (status === 'inactive') result = result.filter(l => !l.statusId);

    const parent = this.filterParent();
    if (parent === 'none') result = result.filter(l => !l.parentLocationId);
    else if (parent !== '') result = result.filter(l => l.parentLocationId === parent);

    return result;
  });

  hasActiveFilters = computed(() =>
    this.searchQuery() !== '' ||
    this.filterType()   !== '' ||
    this.filterStatus() !== 'all' ||
    this.filterParent() !== ''
  );

  // ── Add form ──────────────────────────────────────────
  newLocation: CreateLocation = { name: '', locationTypeId: 0, parentLocationId: null, statusId: true };

  // ── Update form (pre-filled from row click) ───────────
  updateData: UpdateLocation = { locationId: 0, name: '', locationTypeId: 0, parentLocationId: null, statusId: true };

  // ── Delete confirmation ───────────────────────────────
  pendingDelete = signal<Location | null>(null);

  // ── Feedback ──────────────────────────────────────────
  successMessage = signal('');
  errorMessage   = signal('');
  isLoading      = signal(false);
  isDeleting     = signal(false);

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    this.loadAll();
    this.loadTypes();
  }

  loadTypes() {
    this.locationService.getTypes().subscribe({
      next: (types) => this.locationTypeEntries.set(types.map(t => ({ id: t.locationTypeId, name: t.type }))),
      error: () => this.errorMessage.set('Failed to load location types.')
    });
  }

  // ── Helpers ──────────────────────────────────────────

  getTypeName(typeId: number): string {
    return this.locationTypeEntries().find(t => t.id === typeId)?.name ?? `Type ${typeId}`;
  }

  getParentName(parentId: number | null): string {
    if (!parentId) return '—';
    return this.locations().find(l => l.locationId === parentId)?.name ?? `ID ${parentId}`;
  }

  clearFilters() {
    this.searchQuery.set('');
    this.filterType.set('');
    this.filterStatus.set('all');
    this.filterParent.set('');
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
    this.locationService.getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next:  (data) => this.locations.set(data),
        error: (err)  => this.errorMessage.set(err.error?.message ?? 'Failed to fetch locations.')
      });
  }

  // ── Add ──────────────────────────────────────────────

  addLocation() {
    if (!this.newLocation.name.trim())      { this.errorMessage.set('Name is required.'); return; }
    if (!this.newLocation.locationTypeId)   { this.errorMessage.set('Location type is required.'); return; }
    this.isLoading.set(true);
    this.clearMessages();
    this.locationService.create(this.newLocation)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Location created successfully!');
          this.newLocation = { name: '', locationTypeId: 0, parentLocationId: null, statusId: true };
          this.loadAll();
          this.setView('list');
        },
        error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to create location.')
      });
  }

  // ── Inline Update ────────────────────────────────────

  openUpdate(loc: Location) {
    this.updateData = { ...loc };
    this.setView('update');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateLocation() {
    if (!this.updateData.name.trim())    { this.errorMessage.set('Name is required.'); return; }
    if (!this.updateData.locationTypeId) { this.errorMessage.set('Location type is required.'); return; }
    this.isLoading.set(true);
    this.clearMessages();
    this.locationService.update(this.updateData.locationId, this.updateData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Location updated successfully!');
          this.loadAll();
          this.setView('list');
        },
        error: (err) => this.errorMessage.set(err.error?.message ?? 'Failed to update location.')
      });
  }

  // ── Delete with Confirmation ──────────────────────────

  confirmDelete(loc: Location) {
    this.pendingDelete.set(loc);
    this.clearMessages();
  }

  cancelDelete() {
    this.pendingDelete.set(null);
  }

  executeDelete() {
    const loc = this.pendingDelete();
    if (!loc) return;
    this.isDeleting.set(true);
    this.locationService.delete(loc.locationId)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          this.pendingDelete.set(null);
          this.successMessage.set(`"${loc.name}" was deleted successfully.`);
          this.loadAll();
        },
        error: (err) => {
          this.pendingDelete.set(null);
          this.errorMessage.set(err.error?.message ?? `Cannot delete "${loc.name}". It may have dependencies.`);
        }
      });
  }
}
