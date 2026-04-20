import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QcoService } from '../../../core/services/qco.service';
import { ExpiryWatch } from '../../../core/models/inventory-controller.model';

@Component({
  selector: 'app-qco-expiry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Expiry Watch</h2>
          <p class="text-gray-500 text-sm mt-0.5">Monitor lots nearing expiration</p>
        </div>
        <div class="flex items-center gap-2">
          <select
            [value]="selectedDays()"
            (change)="onDaysChange($event)"
            class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
          >
            <option value="30">Within 30 days</option>
            <option value="90">Within 90 days</option>
            <option value="180">Within 180 days</option>
            <option value="365">Within 1 year</option>
            <option value="9999">Show all</option>
          </select>
          <button
            (click)="loadData()"
            class="bg-violet-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-violet-700 transition-colors font-medium flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-red-50 border border-red-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-red-600 uppercase tracking-wide">Critical ≤7 days</p>
          <p class="text-2xl font-bold text-red-700 mt-1">{{ criticalCount() }}</p>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-amber-600 uppercase tracking-wide">Warning 8–30 days</p>
          <p class="text-2xl font-bold text-amber-700 mt-1">{{ warningCount() }}</p>
        </div>
        <div class="bg-violet-50 border border-violet-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-violet-600 uppercase tracking-wide">Notice 31+ days</p>
          <p class="text-2xl font-bold text-violet-700 mt-1">{{ noticeCount() }}</p>
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
            placeholder="Search by item name or batch number..."
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
        } @else if (filteredWatches().length === 0) {
          <div class="text-center py-12">
            <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-gray-500 font-medium text-sm">No expiry watches found</p>
            <p class="text-gray-400 text-xs mt-1">Try selecting a wider date range</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch #</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Days Left</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Flag Date</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (watch of filteredWatches(); track watch.expiryWatchId) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-gray-800">{{ watch.itemName }}</td>
                    <td class="px-4 py-3 text-gray-600">#{{ watch.batchNumber }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ watch.expiryDate | date:'dd MMM yyyy' }}</td>
                    <td class="px-4 py-3">
                      <span class="font-bold text-base"
                        [class]="watch.daysToExpire <= 7 ? 'text-red-600' : watch.daysToExpire <= 30 ? 'text-amber-600' : 'text-violet-600'">
                        {{ watch.daysToExpire }}d
                      </span>
                    </td>
                    <td class="px-4 py-3 text-gray-500 text-xs">{{ watch.flagDate | date:'dd MMM yyyy' }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        [class]="getSeverityClass(watch.daysToExpire)">
                        {{ getSeverityLabel(watch.daysToExpire) }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            {{ filteredWatches().length }} of {{ watches().length }} records
          </div>
        }
      </div>
    </div>
  `,
})
export class QcoExpiryComponent implements OnInit {
  watches = signal<ExpiryWatch[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  selectedDays = signal(9999);

  filteredWatches = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    return this.watches().filter(
      (w) =>
        !term ||
        (w.itemName ?? '').toLowerCase().includes(term) ||
        w.batchNumber?.toString().includes(term)
    );
  });

  criticalCount = computed(() => this.watches().filter((w) => w.daysToExpire <= 7).length);
  warningCount = computed(() => this.watches().filter((w) => w.daysToExpire > 7 && w.daysToExpire <= 30).length);
  noticeCount = computed(() => this.watches().filter((w) => w.daysToExpire > 30).length);

  constructor(private qcoService: QcoService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.qcoService.getExpiryWatch(this.selectedDays()).subscribe({
      next: (data) => { this.watches.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onDaysChange(event: Event) {
    this.selectedDays.set(Number((event.target as HTMLSelectElement).value));
    this.loadData();
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  getSeverityClass(days: number): string {
    if (days <= 7) return 'bg-red-100 text-red-700';
    if (days <= 30) return 'bg-amber-100 text-amber-700';
    return 'bg-violet-100 text-violet-700';
  }

  getSeverityLabel(days: number): string {
    if (days <= 7) return 'Critical';
    if (days <= 30) return 'Warning';
    return 'Notice';
  }
}
