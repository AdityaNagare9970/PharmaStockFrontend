import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LocationService } from '../../core/services/location.service';
import { Location, CreateLocation, UpdateLocation } from '../../core/models/location.model';

type ActiveTab = 'list' | 'add' | 'getById' | 'update' | 'delete';

@Component({
  selector: 'app-location',
  imports: [FormsModule, RouterLink],
  templateUrl: './location.html',
  styleUrl: './location.css'
})
export class LocationComponent {
  activeTab = signal<ActiveTab>('list');

  // List
  locations = signal<Location[]>([]);

  // Get By ID
  searchId = signal(0);
  foundLocation = signal<Location | null>(null);

  // Add
  newLocation: CreateLocation = { name: '', locationTypeId: 1, parentLocationId: null, statusId: true };

  // Update
  updateData: UpdateLocation = { locationId: 0, name: '', locationTypeId: 1, parentLocationId: null, statusId: true };

  // Delete
  deleteId = signal(0);

  // Feedback
  successMessage = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(private locationService: LocationService) {}

  setTab(tab: ActiveTab) {
    this.activeTab.set(tab);
    this.clearMessages();
  }

  clearMessages() {
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  // ── Get All ──────────────────────────────────────────
  loadAll() {
    this.isLoading.set(true);
    this.clearMessages();
    this.locationService.getAll().subscribe({
      next: (data) => {
        this.locations.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Failed to fetch locations.');
        this.isLoading.set(false);
      }
    });
  }

  // ── Get By ID ────────────────────────────────────────
  searchById() {
    if (!this.searchId()) { this.errorMessage.set('Please enter a valid ID.'); return; }
    this.isLoading.set(true);
    this.clearMessages();
    this.locationService.getById(this.searchId()).subscribe({
      next: (data) => {
        this.foundLocation.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.foundLocation.set(null);
        this.errorMessage.set(err.error?.message ?? 'Location not found.');
        this.isLoading.set(false);
      }
    });
  }

  // ── Add ──────────────────────────────────────────────
  addLocation() {
    if (!this.newLocation.name.trim()) { this.errorMessage.set('Name is required.'); return; }
    this.isLoading.set(true);
    this.clearMessages();
    this.locationService.create(this.newLocation).subscribe({
      next: () => {
        this.successMessage.set('Location created successfully!');
        this.newLocation = { name: '', locationTypeId: 1, parentLocationId: null, statusId: true };
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Failed to create location.');
        this.isLoading.set(false);
      }
    });
  }

  // ── Update ───────────────────────────────────────────
  updateLocation() {
    if (!this.updateData.locationId) { this.errorMessage.set('Location ID is required.'); return; }
    if (!this.updateData.name.trim()) { this.errorMessage.set('Name is required.'); return; }
    this.isLoading.set(true);
    this.clearMessages();
    this.locationService.update(this.updateData.locationId, this.updateData).subscribe({
      next: () => {
        this.successMessage.set('Location updated successfully!');
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Failed to update location.');
        this.isLoading.set(false);
      }
    });
  }

  // ── Delete ───────────────────────────────────────────
  deleteLocation() {
    if (!this.deleteId()) { this.errorMessage.set('Please enter a valid ID.'); return; }
    this.isLoading.set(true);
    this.clearMessages();
    this.locationService.delete(this.deleteId()).subscribe({
      next: () => {
        this.successMessage.set(`Location ${this.deleteId()} deleted successfully!`);
        this.deleteId.set(0);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Failed to delete location.');
        this.isLoading.set(false);
      }
    });
  }
}
