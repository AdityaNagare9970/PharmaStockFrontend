import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacistService } from '../../../core/services/pharmacist.service';
import { DispenseRefDTO, CreateDispenseRefDTO, DestinationType } from '../../../core/models/pharmacist.model';

@Component({
  selector: 'app-pharmacist-dispense',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Dispense Records</h2>
          <p class="text-gray-500 text-sm mt-0.5">Manage medication dispensing at your location</p>
        </div>
        <button
          (click)="openModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Dispense
        </button>
      </div>

      <!-- New Dispense Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div class="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 class="text-lg font-semibold text-gray-800">New Dispense</h3>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="p-5 space-y-4">

              <!-- Location ID (read-only) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Location ID</label>
                <input
                  type="number"
                  [value]="1"
                  disabled
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <!-- Item ID -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Item ID</label>
                <input
                  type="number"
                  [(ngModel)]="newDispense.itemId"
                  min="1"
                  placeholder="Enter item ID"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Inventory Lot ID -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Inventory Lot ID</label>
                <input
                  type="number"
                  [(ngModel)]="newDispense.inventoryLotId"
                  min="1"
                  placeholder="Enter inventory lot ID"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Quantity -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
                <input
                  type="number"
                  [(ngModel)]="newDispense.quantity"
                  min="1"
                  placeholder="Enter quantity"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Destination -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Destination Type</label>
                <select
                  [(ngModel)]="newDispense.destination"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option [ngValue]="0" disabled>— Select destination —</option>
                  @for (dt of destinationTypes(); track dt.destinationTypeId) {
                    <option [ngValue]="dt.destinationTypeId">{{ dt.type }}</option>
                  }
                </select>
              </div>

              @if (createError()) {
                <p class="text-red-600 text-sm bg-red-50 p-2.5 rounded-lg">{{ createError() }}</p>
              }
            </div>
            <div class="flex gap-3 p-5 border-t border-gray-100">
              <button
                (click)="closeModal()"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                (click)="submitDispense()"
                [disabled]="creating() || !newDispense.itemId || !newDispense.inventoryLotId || !newDispense.quantity || !newDispense.destination"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (creating()) { Dispensing... } @else { Dispense }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Stats row -->
      @if (!loading() && records().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ todayCount() }}</p>
              <p class="text-xs text-gray-500">Dispensed Today</p>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ records().length }}</p>
              <p class="text-xs text-gray-500">Total Records</p>
            </div>
          </div>
        </div>
      }

      <!-- Search -->
      <div class="bg-white rounded-xl border border-gray-200 px-4 py-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            [value]="searchTerm()"
            (input)="searchTerm.set(getInputValue($event))"
            placeholder="Search by item name..."
            class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <div class="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (error()) {
          <div class="text-center py-12">
            <p class="text-red-600 font-medium text-sm">{{ error() }}</p>
            <button (click)="loadData()" class="mt-2 text-blue-600 text-sm hover:underline">Retry</button>
          </div>
        } @else if (filteredRecords().length === 0) {
          <div class="text-center py-12">
            <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p class="text-gray-500 font-medium text-sm">No dispense records found</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">ID</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch #</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Destination</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (r of filteredRecords(); track r.dispenseRefId) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-gray-600">#{{ r.dispenseRefId }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-blue-400 rounded-full shrink-0"></div>
                        <span class="font-medium text-gray-800">{{ r.itemName }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ r.batchNumber }}</td>
                    <td class="px-4 py-3 text-right font-semibold text-gray-800">{{ r.quantity }}</td>
                    <td class="px-4 py-3 text-gray-500 text-xs">{{ r.dispenseDate | date:'dd MMM yyyy, HH:mm' }}</td>
                    <td class="px-4 py-3 text-gray-600 text-sm">{{ r.destinationName }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        [class]="r.status ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">
                        {{ r.status ? 'Dispensed' : 'Pending' }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            {{ filteredRecords().length }} of {{ records().length }} records
          </div>
        }
      </div>
    </div>
  `,
})
export class PharmacistDispenseComponent implements OnInit {
  records = signal<DispenseRefDTO[]>([]);
  destinationTypes = signal<DestinationType[]>([]);
  loading = signal(true);
  error = signal('');
  searchTerm = signal('');
  showModal = signal(false);
  creating = signal(false);
  createError = signal('');

  newDispense: CreateDispenseRefDTO = {
    locationId: 1,
    itemId: 0,
    inventoryLotId: 0,
    quantity: 0,
    destination: 0,
  };

  filteredRecords = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.records();
    return this.records().filter((r) =>
      r.itemName.toLowerCase().includes(term)
    );
  });

  todayCount = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return this.records().filter(
      (r) => r.dispenseDate && r.dispenseDate.startsWith(today) && r.status
    ).length;
  });

  constructor(private pharmacistService: PharmacistService) {}

  ngOnInit() {
    this.loadData();
    this.pharmacistService.getDestinationTypes().subscribe({
      next: (data) => this.destinationTypes.set(data),
      error: () => {},
    });
  }

  loadData() {
    this.loading.set(true);
    this.error.set('');
    this.pharmacistService.getDispenseRecords().subscribe({
      next: (data) => {
        this.records.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Could not reach server');
        this.loading.set(false);
      },
    });
  }

  openModal() {
    this.newDispense = {
      locationId: 1,
      itemId: 0,
      inventoryLotId: 0,
      quantity: 0,
      destination: 0,
    };
    this.createError.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.createError.set('');
  }

  submitDispense() {
    this.createError.set('');
    if (!this.newDispense.itemId || !this.newDispense.inventoryLotId || !this.newDispense.quantity || !this.newDispense.destination) {
      this.createError.set('Please fill in all required fields.');
      return;
    }
    if (this.newDispense.quantity < 1) {
      this.createError.set('Quantity must be at least 1.');
      return;
    }
    this.creating.set(true);
    this.pharmacistService.createDispense(this.newDispense).subscribe({
      next: () => {
        this.creating.set(false);
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        this.createError.set(err.error?.message || 'Failed to create dispense record');
        this.creating.set(false);
      },
    });
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
