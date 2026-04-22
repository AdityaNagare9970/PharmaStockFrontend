import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacistService } from '../../../core/services/pharmacist.service';
import { InventoryBalance } from '../../../core/models/inventory-controller.model';

@Component({
  selector: 'app-pharmacist-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div>
        <h2 class="text-xl font-bold text-gray-800">My Stock</h2>
        <p class="text-gray-500 text-sm mt-0.5">Inventory available at your location</p>
      </div>

      <!-- Stats row -->
      @if (!loading() && items().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ items().length }}</p>
              <p class="text-xs text-gray-500">Total Items</p>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ lowStockCount() }}</p>
              <p class="text-xs text-gray-500">Low Stock (available &lt; 10)</p>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ outOfStockCount() }}</p>
              <p class="text-xs text-gray-500">Out of Stock</p>
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
            placeholder="Search by item name or batch number..."
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
        } @else if (filteredItems().length === 0) {
          <div class="text-center py-12">
            <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p class="text-gray-500 font-medium text-sm">No stock items found</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch #</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">On Hand</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reserved</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Available</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (item of filteredItems(); track item.inventoryBalanceId) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-blue-400 rounded-full shrink-0"></div>
                        <span class="font-medium text-gray-800">{{ item.itemName }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ item.batchNumber }}</td>
                    <td class="px-4 py-3 text-gray-500 text-xs">
                      {{ item.expiryDate ? (item.expiryDate | date:'dd MMM yyyy') : '—' }}
                    </td>
                    <td class="px-4 py-3 text-right font-semibold text-gray-800">{{ item.quantityOnHand }}</td>
                    <td class="px-4 py-3 text-right text-gray-500">{{ item.reservedQty }}</td>
                    <td class="px-4 py-3 text-right">
                      <span class="inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-0.5 rounded-full text-xs font-bold"
                        [class]="getAvailabilityClass(item.availableQty)">
                        {{ item.availableQty }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            {{ filteredItems().length }} of {{ items().length }} items
          </div>
        }
      </div>
    </div>
  `,
})
export class PharmacistStockComponent implements OnInit {
  items = signal<InventoryBalance[]>([]);
  loading = signal(true);
  error = signal('');
  searchTerm = signal('');

  myLocationId = 1;

  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.items();
    return this.items().filter(
      (i) =>
        i.itemName.toLowerCase().includes(term) ||
        i.batchNumber.toString().includes(term)
    );
  });

  lowStockCount = computed(
    () => this.items().filter((i) => i.availableQty > 0 && i.availableQty < 10).length
  );

  outOfStockCount = computed(
    () => this.items().filter((i) => i.availableQty === 0).length
  );

  constructor(private pharmacistService: PharmacistService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set('');
    this.pharmacistService.getInventoryByLocation(this.myLocationId).subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Could not reach server');
        this.loading.set(false);
      },
    });
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  getAvailabilityClass(qty: number): string {
    if (qty === 0) return 'bg-red-100 text-red-700';
    if (qty <= 20) return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-700';
  }
}
