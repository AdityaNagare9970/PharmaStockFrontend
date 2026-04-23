import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacistService } from '../../../core/services/pharmacist.service';
import { ExpiryWatch } from '../../../core/models/inventory-controller.model';

@Component({
  selector: 'app-pharmacist-expiry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Expiry Watch</h2>
          <p class="text-gray-500 text-sm mt-0.5">Monitor near-expiry items at your location</p>
        </div>
        <!-- Days filter -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 font-medium whitespace-nowrap">Show items expiring within</label>
          <select
            [(ngModel)]="selectedDays"
            (ngModelChange)="loadData()"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option [ngValue]="30">30 days</option>
            <option [ngValue]="60">60 days</option>
            <option [ngValue]="90">90 days</option>
            <option [ngValue]="180">180 days</option>
            <option [ngValue]="9999">All</option>
          </select>
        </div>
      </div>

      <!-- Stats row -->
      @if (!loading() && items().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ criticalCount() }}</p>
              <p class="text-xs text-gray-500">Critical (&lt; 7 days)</p>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ warningCount() }}</p>
              <p class="text-xs text-gray-500">Warning (7–30 days)</p>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ items().length }}</p>
              <p class="text-xs text-gray-500">Total Watched</p>
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-gray-500 font-medium text-sm">No expiry watch items found</p>
            <p class="text-gray-400 text-xs mt-1">No items expiring within the selected window</p>
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
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (item of filteredItems(); track item.expiryWatchId) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full shrink-0"
                          [class]="item.daysToExpire <= 7 ? 'bg-red-500' : item.daysToExpire <= 30 ? 'bg-amber-500' : 'bg-blue-400'">
                        </div>
                        <span class="font-medium text-gray-800">{{ item.itemName }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ item.batchNumber }}</td>
                    <td class="px-4 py-3 text-gray-500 text-xs">{{ item.expiryDate | date:'dd MMM yyyy' }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-bold"
                        [class]="getDaysClass(item.daysToExpire)">
                        {{ item.daysToExpire }}d
                      </span>
                    </td>
                    <td class="px-4 py-3 text-gray-400 text-xs">{{ item.flagDate | date:'dd MMM yyyy' }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        [class]="item.status ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'">
                        {{ item.status ? 'Active' : 'Inactive' }}
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
export class PharmacistExpiryComponent implements OnInit {
  items = signal<ExpiryWatch[]>([]);
  loading = signal(true);
  error = signal('');
  searchTerm = signal('');
  selectedDays = 90;

  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.items();
    return this.items().filter(
      (i) =>
        i.itemName.toLowerCase().includes(term) ||
        i.batchNumber.toString().includes(term)
    );
  });

  criticalCount = computed(() => this.items().filter((i) => i.daysToExpire <= 7).length);
  warningCount = computed(() => this.items().filter((i) => i.daysToExpire > 7 && i.daysToExpire <= 30).length);

  constructor(private pharmacistService: PharmacistService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set('');
    this.pharmacistService.getExpiryWatch(this.selectedDays).subscribe({
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

  getDaysClass(days: number): string {
    if (days <= 7) return 'bg-red-100 text-red-700';
    if (days <= 30) return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  }
}
