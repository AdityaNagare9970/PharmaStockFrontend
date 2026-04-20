import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryControllerService } from '../../../core/services/inventory-controller.service';
import { TransferOrder, PharmLocation } from '../../../core/models/inventory-controller.model';

@Component({
  selector: 'app-transfer-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Transfer Orders</h2>
          <p class="text-gray-500 text-sm mt-0.5">Manage internal stock transfers between locations</p>
        </div>
        <button
          (click)="showCreateModal.set(true)"
          class="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Transfer Order
        </button>
      </div>

      <!-- Create Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div class="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 class="text-lg font-semibold text-gray-800">New Transfer Order</h3>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">From Location</label>
                <select
                  [(ngModel)]="newTransfer.fromLocationId"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option [ngValue]="0" disabled>— Select source location —</option>
                  @for (loc of locations(); track loc.locationId) {
                    <option [ngValue]="loc.locationId">{{ loc.name }}</option>
                  }
                </select>
              </div>

              <div class="flex items-center justify-center">
                <div class="flex-1 h-px bg-gray-200"></div>
                <div class="mx-3 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div class="flex-1 h-px bg-gray-200"></div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">To Location</label>
                <select
                  [(ngModel)]="newTransfer.toLocationId"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option [ngValue]="0" disabled>— Select destination location —</option>
                  @for (loc of locations(); track loc.locationId) {
                    <option [ngValue]="loc.locationId"
                      [disabled]="loc.locationId === newTransfer.fromLocationId">
                      {{ loc.name }}{{ loc.locationId === newTransfer.fromLocationId ? ' (selected as source)' : '' }}
                    </option>
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
                (click)="createOrder()"
                [disabled]="creating() || !newTransfer.fromLocationId || !newTransfer.toLocationId"
                class="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (creating()) { Creating... } @else { Create Order }
              </button>
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
            placeholder="Search by order ID or location name..."
            class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <div class="w-7 h-7 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (filteredOrders().length === 0) {
          <div class="text-center py-12">
            <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p class="text-gray-500 font-medium text-sm">No transfer orders found</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">ID</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">From</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">To</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (order of filteredOrders(); track order.transferOrderId) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-gray-600">#{{ order.transferOrderId }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-teal-400 rounded-full shrink-0"></div>
                        <span class="font-medium text-gray-800">{{ locationName(order.fromLocationId) }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-emerald-400 rounded-full shrink-0"></div>
                        <span class="font-medium text-gray-800">{{ locationName(order.toLocationId) }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-500 text-xs">{{ order.createdDate | date:'dd MMM yyyy, HH:mm' }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        [class]="getStatusClass(order.status)">
                        {{ getStatusLabel(order.status) }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            {{ filteredOrders().length }} of {{ orders().length }} orders
          </div>
        }
      </div>
    </div>
  `,
})
export class TransferOrdersComponent implements OnInit {
  orders = signal<TransferOrder[]>([]);
  locations = signal<PharmLocation[]>([]);
  loading = signal(true);
  showCreateModal = signal(false);
  creating = signal(false);
  createError = signal('');
  searchTerm = signal('');

  newTransfer = { fromLocationId: 0, toLocationId: 0 };

  filteredOrders = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.orders();
    return this.orders().filter((o) => {
      const from = this.locationName(o.fromLocationId).toLowerCase();
      const to = this.locationName(o.toLocationId).toLowerCase();
      return (
        o.transferOrderId.toString().includes(term) ||
        from.includes(term) ||
        to.includes(term)
      );
    });
  });

  constructor(private icService: InventoryControllerService) {}

  ngOnInit() {
    this.icService.getLocations().subscribe({
      next: (locs) => this.locations.set(locs),
      error: () => {},
    });
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.icService.getTransferOrders().subscribe({
      next: (data) => { this.orders.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  locationName(id: number): string {
    return this.locations().find((l) => l.locationId === id)?.name ?? `Location #${id}`;
  }

  closeModal() {
    this.showCreateModal.set(false);
    this.createError.set('');
    this.newTransfer = { fromLocationId: 0, toLocationId: 0 };
  }

  createOrder() {
    this.createError.set('');
    if (!this.newTransfer.fromLocationId || !this.newTransfer.toLocationId) {
      this.createError.set('Please select both source and destination locations.');
      return;
    }
    if (this.newTransfer.fromLocationId === this.newTransfer.toLocationId) {
      this.createError.set('Source and destination must be different locations.');
      return;
    }
    this.creating.set(true);
    this.icService.createTransferOrder(this.newTransfer).subscribe({
      next: () => {
        this.creating.set(false);
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        this.createError.set(err.error?.message || 'Failed to create order');
        this.creating.set(false);
      },
    });
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'bg-blue-100 text-blue-700';
      case 2: return 'bg-yellow-100 text-yellow-700';
      case 3: return 'bg-green-100 text-green-700';
      case 4: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Open';
      case 2: return 'In Progress';
      case 3: return 'Completed';
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
  }
}
