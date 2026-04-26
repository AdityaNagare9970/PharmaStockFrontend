import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryControllerService } from '../../../core/services/inventory-controller.service';
import { InventoryBalance } from '../../../core/models/inventory-controller.model';

@Component({
  selector: 'app-stock-balance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 p-6">

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Stock Balance</h2>
          <p class="text-gray-500 text-sm mt-0.5">Current on-hand quantity by item, location and batch</p>
        </div>
      </div>

      <!-- Search -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <input
          type="text"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Search by item name, location or batch..."
          [value]="searchQuery()"
          (input)="searchQuery.set(getVal($event))"
        />
      </div>

      <!-- Summary cards -->
      @if (!loading() && balances().length > 0) {
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Total Records</p>
            <p class="text-2xl font-bold text-gray-800">{{ filteredBalances().length }}</p>
          </div>
          <div class="bg-green-50 rounded-xl border border-green-100 p-4 text-center">
            <p class="text-xs text-green-500 mb-1">Total On Hand</p>
            <p class="text-2xl font-bold text-green-700">{{ totalOnHand() }}</p>
          </div>
          <div class="bg-blue-50 rounded-xl border border-blue-100 p-4 text-center">
            <p class="text-xs text-blue-500 mb-1">Total Available</p>
            <p class="text-2xl font-bold text-blue-700">{{ totalAvailable() }}</p>
          </div>
        </div>
      }

      <!-- Table -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center py-16">
            <div class="w-7 h-7 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <span class="ml-2 text-sm text-gray-500">Loading balances...</span>
          </div>
        } @else if (filteredBalances().length === 0) {
          <div class="text-center py-16">
            <p class="text-gray-600 font-semibold">No stock balance records found</p>
            <p class="text-gray-400 text-sm mt-1">Stock is populated after GRN QC is completed.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Item</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Batch #</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Bin</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Expiry</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">On Hand</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Available</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (b of filteredBalances(); track b.inventoryBalanceId) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-gray-800">{{ b.itemName }}</td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-xs">#{{ b.batchNumber }}</td>
                    <td class="px-4 py-3 text-gray-500 text-xs">{{ b.locationName }}</td>
                    <td class="px-4 py-3 text-gray-400 text-xs">{{ b.binCode }}</td>
                    <td class="px-4 py-3 text-xs" [class]="expiryClass(b.expiryDate)">
                      {{ formatDate(b.expiryDate) }}
                    </td>
                    <td class="px-4 py-3 text-right font-bold text-gray-800">{{ b.quantityOnHand }}</td>
                    <td class="px-4 py-3 text-right font-bold text-green-600">{{ b.availableQty }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            {{ filteredBalances().length }} records
          </div>
        }
      </div>

    </div>
  `
})
export class StockBalanceComponent implements OnInit {
  balances    = signal<InventoryBalance[]>([]);
  loading     = signal(true);
  searchQuery = signal('');

  filteredBalances = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.balances();
    return this.balances().filter(b =>
      b.itemName?.toLowerCase().includes(q) ||
      b.locationName?.toLowerCase().includes(q) ||
      b.batchNumber?.toString().toLowerCase().includes(q)
    );
  });

  totalOnHand   = computed(() => this.filteredBalances().reduce((s, b) => s + b.quantityOnHand, 0));
  totalAvailable = computed(() => this.filteredBalances().reduce((s, b) => s + b.availableQty, 0));

  constructor(private icService: InventoryControllerService) {}

  ngOnInit() {
    this.icService.getInventoryBalances().subscribe({
      next: data => { this.balances.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getVal(e: Event) { return (e.target as HTMLInputElement).value; }

  formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  expiryClass(d: string | null): string {
    if (!d) return 'text-gray-400';
    const days = Math.floor((new Date(d).getTime() - Date.now()) / 86400000);
    if (days < 0)   return 'text-red-600 font-semibold';
    if (days <= 90) return 'text-orange-500';
    return 'text-gray-500';
  }
}
