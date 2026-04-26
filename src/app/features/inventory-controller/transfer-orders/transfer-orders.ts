import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryControllerService } from '../../../core/services/inventory-controller.service';
import { TransferOrder, PharmLocation, InventoryBalance } from '../../../core/models/inventory-controller.model';

interface TransferLineItem {
  inventoryBalanceId: number;
  itemId: number;
  inventoryLotId: number;
  itemName: string;
  batchNumber: string;
  expiryDate: string | null;
  availableQty: number;
  transferQty: number;
  selected: boolean;
}

type CreateStep = 'locations' | 'items';

@Component({
  selector: 'app-transfer-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 p-6">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Transfer Orders</h2>
          <p class="text-gray-500 text-sm mt-0.5">Manage internal stock transfers between locations</p>
        </div>
        @if (!showCreateForm()) {
          <button (click)="openCreate()"
            class="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 font-medium flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Transfer Order
          </button>
        }
      </div>

      <!-- ── INLINE CREATE FORM ── -->
      @if (showCreateForm()) {
        <div class="bg-white border border-teal-200 rounded-2xl overflow-hidden">

          <!-- Form header -->
          <div class="bg-teal-600 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 class="text-white font-semibold">New Transfer Order</h3>
              <p class="text-teal-100 text-xs mt-0.5">
                {{ createStep() === 'locations' ? 'Step 1 — Select locations' : 'Step 2 — Select items to transfer' }}
              </p>
            </div>
            <button (click)="cancelCreate()" class="text-teal-200 hover:text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-5">

            <!-- STEP 1: Locations -->
            @if (createStep() === 'locations') {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5">From Location <span class="text-red-500">*</span></label>
                  <select class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    [(ngModel)]="fromLocationId" name="from">
                    <option [ngValue]="0" disabled>— Select source —</option>
                    @for (loc of locations(); track loc.locationId) {
                      <option [ngValue]="loc.locationId">{{ loc.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5">To Location <span class="text-red-500">*</span></label>
                  <select class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    [(ngModel)]="toLocationId" name="to">
                    <option [ngValue]="0" disabled>— Select destination —</option>
                    @for (loc of locations(); track loc.locationId) {
                      <option [ngValue]="loc.locationId" [disabled]="loc.locationId === fromLocationId">
                        {{ loc.name }}
                      </option>
                    }
                  </select>
                </div>
              </div>

              @if (createError()) {
                <p class="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{{ createError() }}</p>
              }

              <div class="flex gap-3 pt-2">
                <button (click)="cancelCreate()"
                  class="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button (click)="goToItemStep()"
                  [disabled]="!fromLocationId || !toLocationId || loadingStock()"
                  class="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2">
                  @if (loadingStock()) {
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Loading stock...
                  } @else {
                    Next — Select Items
                  }
                </button>
              </div>
            }

            <!-- STEP 2: Items -->
            @if (createStep() === 'items') {
              <div class="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
                <svg class="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
                <span class="text-teal-800">
                  <strong>{{ locationName(fromLocationId) }}</strong>
                  &nbsp;→&nbsp;
                  <strong>{{ locationName(toLocationId) }}</strong>
                </span>
                <button (click)="createStep.set('locations')" class="ml-auto text-teal-600 text-xs underline">Change</button>
              </div>

              @if (stockItems().length === 0) {
                <div class="text-center py-8 text-gray-500 text-sm">
                  No stock available at this location to transfer.
                </div>
              } @else {
                <p class="text-sm text-gray-500">Select items and enter transfer quantity:</p>
                <div class="space-y-3">
                  @for (item of stockItems(); track item.inventoryBalanceId; let i = $index) {
                    <div class="border rounded-xl p-4 transition-colors"
                      [class]="item.selected ? 'border-teal-300 bg-teal-50' : 'border-gray-200 bg-white'">
                      <div class="flex items-start gap-3">
                        <input type="checkbox" class="mt-1 w-4 h-4 accent-teal-600"
                          [checked]="item.selected"
                          (change)="toggleSelect(i, $any($event.target).checked)"
                          [name]="'sel_' + i" />
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center justify-between flex-wrap gap-2">
                            <span class="font-semibold text-gray-800 text-sm">{{ item.itemName }}</span>
                            <span class="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">Batch: {{ item.batchNumber }}</span>
                          </div>
                          <div class="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                            <span>Available: <strong class="text-teal-700">{{ item.availableQty }}</strong></span>
                            @if (item.expiryDate) {
                              <span>Expiry: {{ formatDate(item.expiryDate) }}</span>
                            }
                          </div>
                          @if (item.selected) {
                            <div class="mt-3 flex items-center gap-3">
                              <label class="text-xs font-semibold text-gray-700">Transfer Qty:</label>
                              <input type="number" class="w-28 px-2.5 py-1.5 border border-teal-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                [value]="item.transferQty"
                                (input)="updateQty(i, +$any($event.target).value)"
                                [name]="'qty_' + i"
                                [min]="1" [max]="item.availableQty" />
                              <span class="text-xs text-gray-400">max {{ item.availableQty }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }

              @if (createError()) {
                <p class="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{{ createError() }}</p>
              }

              <div class="flex gap-3 pt-2">
                <button (click)="createStep.set('locations')"
                  class="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Back
                </button>
                <button (click)="cancelCreate()"
                  class="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button (click)="submitTransfer()"
                  [disabled]="creating() || selectedCount() === 0"
                  class="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2">
                  @if (creating()) {
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Creating...
                  } @else {
                    Create Transfer ({{ selectedCount() }} item{{ selectedCount() !== 1 ? 's' : '' }})
                  }
                </button>
              </div>
            }

          </div>
        </div>
      }

      <!-- Search -->
      <div class="bg-white rounded-xl border border-gray-200 px-4 py-3">
        <input type="text" [value]="searchTerm()" (input)="searchTerm.set(getVal($event))"
          placeholder="Search by order ID or location name..."
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <div class="w-7 h-7 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (filteredOrders().length === 0) {
          <div class="text-center py-12 text-gray-500 text-sm">No transfer orders found.</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">From</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">To</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (order of filteredOrders(); track order.transferOrderId) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 font-medium text-gray-600">#{{ order.transferOrderId }}</td>
                    <td class="px-4 py-3 font-medium text-gray-800">{{ locationName(order.fromLocationId) }}</td>
                    <td class="px-4 py-3 font-medium text-gray-800">{{ locationName(order.toLocationId) }}</td>
                    <td class="px-4 py-3 text-gray-500 text-xs">{{ order.createdDate | date:'dd MMM yyyy' }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        [class]="getStatusClass(order.status)">{{ getStatusLabel(order.status) }}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            {{ filteredOrders().length }} orders
          </div>
        }
      </div>

    </div>
  `
})
export class TransferOrdersComponent implements OnInit {
  orders    = signal<TransferOrder[]>([]);
  locations = signal<PharmLocation[]>([]);
  loading   = signal(true);
  creating  = signal(false);
  loadingStock = signal(false);
  createError  = signal('');
  searchTerm   = signal('');
  showCreateForm = signal(false);
  createStep     = signal<CreateStep>('locations');
  stockItems     = signal<TransferLineItem[]>([]);

  fromLocationId = 0;
  toLocationId   = 0;

  selectedCount = computed(() => this.stockItems().filter(i => i.selected).length);

  filteredOrders = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.orders();
    return this.orders().filter(o =>
      o.transferOrderId.toString().includes(term) ||
      this.locationName(o.fromLocationId).toLowerCase().includes(term) ||
      this.locationName(o.toLocationId).toLowerCase().includes(term)
    );
  });

  constructor(private icService: InventoryControllerService) {}

  ngOnInit() {
    this.icService.getLocations().subscribe({ next: locs => this.locations.set(locs) });
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.icService.getTransferOrders().subscribe({
      next: data => { this.orders.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate() {
    this.fromLocationId = 0;
    this.toLocationId   = 0;
    this.stockItems.set([]);
    this.createError.set('');
    this.createStep.set('locations');
    this.showCreateForm.set(true);
  }

  cancelCreate() {
    this.showCreateForm.set(false);
  }

  goToItemStep() {
    this.createError.set('');
    if (!this.fromLocationId || !this.toLocationId) {
      this.createError.set('Please select both locations.'); return;
    }
    if (this.fromLocationId === this.toLocationId) {
      this.createError.set('Source and destination must be different.'); return;
    }
    this.loadingStock.set(true);
    this.icService.getInventoryBalancesByLocation(this.fromLocationId).subscribe({
      next: balances => {
        this.stockItems.set(balances.map(b => ({
          inventoryBalanceId: b.inventoryBalanceId,
          itemId:             b.itemId,
          inventoryLotId:     b.inventoryLotId,
          itemName:           b.itemName,
          batchNumber:        b.batchNumber?.toString() ?? '',
          expiryDate:         b.expiryDate,
          availableQty:       b.availableQty,
          transferQty:        1,
          selected:           false
        })));
        this.loadingStock.set(false);
        this.createStep.set('items');
      },
      error: () => { this.loadingStock.set(false); this.createError.set('Failed to load stock.'); }
    });
  }

  submitTransfer() {
    const selected = this.stockItems().filter(i => i.selected);
    if (selected.length === 0) { this.createError.set('Select at least one item.'); return; }

    for (const item of selected) {
      if (item.transferQty < 1 || item.transferQty > item.availableQty) {
        this.createError.set(`Invalid quantity for ${item.itemName}. Must be 1–${item.availableQty}.`);
        return;
      }
    }

    this.creating.set(true);
    this.createError.set('');

    this.icService.createTransferOrder({ fromLocationId: this.fromLocationId, toLocationId: this.toLocationId })
      .subscribe({
        next: order => this.addItemsSequentially(order.transferOrderId, selected, 0),
        error: err => { this.creating.set(false); this.createError.set(err.error?.message || 'Failed to create order.'); }
      });
  }

  private addItemsSequentially(orderId: number, items: TransferLineItem[], index: number) {
    if (index >= items.length) {
      this.creating.set(false);
      this.showCreateForm.set(false);
      this.loadData();
      return;
    }
    const item = items[index];
    this.icService.addTransferItem({ transferOrderId: orderId, itemId: item.itemId, inventoryLotId: item.inventoryLotId, quantity: item.transferQty })
      .subscribe({
        next: () => this.addItemsSequentially(orderId, items, index + 1),
        error: err => { this.creating.set(false); this.createError.set(`Failed to add ${item.itemName}: ${err.error?.message || err.message}`); }
      });
  }

  toggleSelect(index: number, selected: boolean) {
    this.stockItems.update(items =>
      items.map((item, i) => i === index ? { ...item, selected } : item)
    );
  }

  updateQty(index: number, qty: number) {
    this.stockItems.update(items =>
      items.map((item, i) => i === index ? { ...item, transferQty: qty } : item)
    );
  }

  locationName(id: number): string {
    return this.locations().find(l => l.locationId === id)?.name ?? `Location #${id}`;
  }

  formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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

  getVal(e: Event): string { return (e.target as HTMLInputElement).value; }
}
