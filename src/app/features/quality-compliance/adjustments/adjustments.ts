import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QcoService } from '../../../core/services/qco.service';
import { StockAdjustmentDTO } from '../../../core/models/qco.model';

@Component({
  selector: 'app-adjustments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Stock Adjustments</h2>
          <p class="text-gray-500 text-sm mt-0.5">Inventory quantity adjustments log</p>
        </div>
        <button
          (click)="loadData()"
          class="bg-violet-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-violet-700 transition-colors font-medium flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-green-50 border border-green-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-green-600 uppercase tracking-wide">Positive (+)</p>
          <p class="text-2xl font-bold text-green-700 mt-1">{{ positiveCount() }}</p>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-red-600 uppercase tracking-wide">Negative (−)</p>
          <p class="text-2xl font-bold text-red-700 mt-1">{{ negativeCount() }}</p>
        </div>
        <div class="bg-violet-50 border border-violet-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-violet-600 uppercase tracking-wide">Total</p>
          <p class="text-2xl font-bold text-violet-700 mt-1">{{ adjustments().length }}</p>
        </div>
      </div>

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
            placeholder="Search by item name or location..."
            class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center py-12">
            <div class="w-7 h-7 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (filtered().length === 0) {
          <div class="text-center py-12">
            <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <p class="text-gray-500 font-medium text-sm">No stock adjustments found</p>
            <p class="text-gray-400 text-xs mt-1">No records match your search criteria</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch #</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty Delta</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Approved By</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (a of filtered(); track a.stockAdjustmentId) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-gray-500 text-xs">#{{ a.stockAdjustmentId }}</td>
                    <td class="px-4 py-3 font-medium text-gray-800">{{ a.itemName }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ a.locationName }}</td>
                    <td class="px-4 py-3 text-gray-600">#{{ a.batchNumber }}</td>
                    <td class="px-4 py-3">
                      <span class="font-bold text-base"
                        [class]="a.quantityDelta >= 0 ? 'text-green-600' : 'text-red-600'">
                        {{ a.quantityDelta >= 0 ? '+' : '' }}{{ a.quantityDelta }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-gray-600 max-w-xs truncate">{{ a.reasonDescription }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ a.approvedByName }}</td>
                    <td class="px-4 py-3 text-gray-500 text-xs">{{ a.postedDate | date:'dd MMM yyyy' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            {{ filtered().length }} of {{ adjustments().length }} records
          </div>
        }
      </div>
    </div>
  `,
})
export class AdjustmentsComponent implements OnInit {
  adjustments = signal<StockAdjustmentDTO[]>([]);
  loading = signal(true);
  searchTerm = signal('');

  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    return this.adjustments().filter(
      (a) =>
        !term ||
        (a.itemName ?? '').toLowerCase().includes(term) ||
        (a.locationName ?? '').toLowerCase().includes(term)
    );
  });

  positiveCount = computed(() => this.adjustments().filter((a) => a.quantityDelta >= 0).length);
  negativeCount = computed(() => this.adjustments().filter((a) => a.quantityDelta < 0).length);

  constructor(private qcoService: QcoService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.qcoService.getStockAdjustments().subscribe({
      next: (data) => { this.adjustments.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
