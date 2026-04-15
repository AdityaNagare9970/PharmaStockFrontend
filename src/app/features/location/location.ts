import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LocationService } from '../../core/services/location.service';
import { Location, LocationTypeEnum, CreateLocation, UpdateLocation } from '../../core/models/location.model';
import { finalize } from 'rxjs';

type ActiveView = 'list' | 'add' | 'update';

@Component({
  selector: 'app-location',
  imports: [FormsModule, RouterLink],
  templateUrl: './location.html',
  styleUrl: './location.css'
})
export class LocationComponent implements OnInit {

  activeView = signal<ActiveView>('list');

  locations = signal<Location[]>([]);
  searchQuery = signal('');

  filteredLocations = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.locations();
    return this.locations().filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.locationId.toString() === q
    );
  });

  // Add form
  newLocation: CreateLocation = { name: '', locationTypeId: 0, parentLocationId: null, statusId: true };

  // Update form (pre-filled from row click)
  updateData: UpdateLocation = { locationId: 0, name: '', locationTypeId: 0, parentLocationId: null, statusId: true };

  // Delete confirmation
  pendingDelete = signal<Location | null>(null);

  // Feedback
  successMessage = signal('');
  errorMessage   = signal('');
  isLoading      = signal(false);
  isDeleting     = signal(false);

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    this.loadAll();
  }

  // ── Helpers ──────────────────────────────────────────

  getTypeName(typeId: number): string {
    return LocationTypeEnum[typeId] ?? `Type ${typeId}`;
  }

  getParentName(parentId: number | null): string {
    if (!parentId) return '—';
    return this.locations().find(l => l.locationId === parentId)?.name ?? `ID ${parentId}`;
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
    if (!this.newLocation.name.trim()) { this.errorMessage.set('Name is required.'); return; }
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
    if (!this.updateData.name.trim()) { this.errorMessage.set('Name is required.'); return; }
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
