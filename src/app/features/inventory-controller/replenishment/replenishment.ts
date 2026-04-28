import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryControllerService } from '../../../core/services/inventory-controller.service';
import {
  ReplenishmentRequest,
  ReplenishmentRule,
} from '../../../core/models/inventory-controller.model';

@Component({
  selector: 'app-replenishment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-5 p-6">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Replenishment</h2>
          <p class="text-gray-500 text-sm mt-0.5">Manage replenishment requests and rules</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            (click)="activeTab.set('requests')"
            [class]="activeTab() === 'requests'
              ? 'px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold shadow-sm'
              : 'px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50'"
          >Requests</button>
          <button
            (click)="activeTab.set('rules')"
            [class]="activeTab() === 'rules'
              ? 'px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold shadow-sm'
              : 'px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50'"
          >Rules</button>

          @if (activeTab() === 'requests') {
            <button
              (click)="runCheck()"
              [disabled]="runningCheck()"
              class="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-amber-600 transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              @if (runningCheck()) {
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Checking...
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Run Check
              }
            </button>
          }
        </div>
      </div>

      <!-- ── REQUESTS TAB ── -->
      @if (activeTab() === 'requests') {

        <!-- Run Check Result Banner -->
        @if (checkResult()) {
          <div class="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <div class="flex items-center gap-2 text-amber-800 text-sm font-medium">
              <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ checkResult() }}
            </div>
            <button (click)="checkResult.set('')" class="text-amber-400 hover:text-amber-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        }

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide">Pending</p>
            <p class="text-2xl font-bold text-blue-700 mt-1">{{ pendingCount() }}</p>
          </div>
          <div class="bg-green-50 border border-green-200 rounded-xl p-4">
            <p class="text-xs font-semibold text-green-600 uppercase tracking-wide">Converted</p>
            <p class="text-2xl font-bold text-green-700 mt-1">{{ convertedCount() }}</p>
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</p>
            <p class="text-2xl font-bold text-gray-700 mt-1">{{ requests().length }}</p>
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
              (input)="searchTerm.set(getVal($event))"
              placeholder="Search by item name or location..."
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <!-- Requests Table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          @if (loading()) {
            <div class="flex items-center justify-center py-12">
              <div class="w-7 h-7 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          } @else if (filteredRequests().length === 0) {
            <div class="text-center py-14">
              <div class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p class="text-gray-600 font-semibold">No replenishment requests yet</p>
              <p class="text-gray-400 text-sm mt-1">Click <strong>Run Check</strong> to trigger automatic replenishment</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-100">
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Item</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Qty</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (req of filteredRequests(); track req.replenishmentRequestId) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-4 py-3 text-gray-400 text-xs">#{{ req.replenishmentRequestId }}</td>
                      <td class="px-4 py-3 font-medium text-gray-800">{{ req.itemName || ('Item #' + req.itemId) }}</td>
                      <td class="px-4 py-3 text-gray-600">{{ req.locationName || ('Location #' + req.locationId) }}</td>
                      <td class="px-4 py-3 font-bold text-teal-700">{{ req.suggestedQty }}</td>
                      <td class="px-4 py-3 text-gray-400 text-xs">{{ req.createdDate | date:'dd MMM yyyy' }}</td>
                      <td class="px-4 py-3">
                        <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                          [class]="statusClass(req.status)">
                          {{ statusLabel(req.status) }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
              {{ filteredRequests().length }} of {{ requests().length }} requests
            </div>
          }
        </div>
      }

      <!-- ── RULES TAB ── -->
      @if (activeTab() === 'rules') {
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          @if (loadingRules()) {
            <div class="flex items-center justify-center py-12">
              <div class="w-7 h-7 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          } @else if (rules().length === 0) {
            <div class="text-center py-12">
              <p class="text-gray-500 font-medium text-sm">No replenishment rules configured</p>
              <p class="text-gray-400 text-xs mt-1">Ask the admin to set up min/max/par rules</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-100">
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rule</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Item</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                    <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Min</th>
                    <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Par</th>
                    <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Max</th>
                    <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Review</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (rule of rules(); track rule.replenishmentRuleId) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-4 py-3 text-gray-400 text-xs">#{{ rule.replenishmentRuleId }}</td>
                      <td class="px-4 py-3 font-medium text-gray-800">{{ rule.itemName || ('Item #' + rule.itemId) }}</td>
                      <td class="px-4 py-3 text-gray-600">{{ rule.locationName || ('Location #' + rule.locationId) }}</td>
                      <td class="px-4 py-3 text-center text-gray-600">{{ rule.minLevel }}</td>
                      <td class="px-4 py-3 text-center font-bold text-teal-700">{{ rule.parLevel }}</td>
                      <td class="px-4 py-3 text-center text-gray-600">{{ rule.maxLevel }}</td>
                      <td class="px-4 py-3">
                        <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium"
                          [class]="rule.reviewCycle ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                          {{ rule.reviewCycle ? 'Active' : 'Off' }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
              {{ rules().length }} rules configured
            </div>
          }
        </div>
      }

    </div>
  `,
})
export class ReplenishmentComponent implements OnInit {
  requests      = signal<ReplenishmentRequest[]>([]);
  rules         = signal<ReplenishmentRule[]>([]);
  loading       = signal(true);
  loadingRules  = signal(false);
  activeTab     = signal<'requests' | 'rules'>('requests');
  searchTerm    = signal('');

  filteredRequests = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.requests();
    return this.requests().filter((r) =>
      (r.itemName || '').toLowerCase().includes(term) ||
      (r.locationName || '').toLowerCase().includes(term)
    );
  });

  pendingCount   = computed(() => this.requests().filter((r) => r.status === 1).length);
  convertedCount = computed(() => this.requests().filter((r) => r.status === 2).length);

  runningCheck = signal(false);
  checkResult  = signal('');

  constructor(private icService: InventoryControllerService) {}

  ngOnInit() {
    this.loadRequests();
    this.loadRules();
  }

  loadRequests() {
    this.loading.set(true);
    this.icService.getReplenishmentRequests().subscribe({
      next: (d) => { this.requests.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadRules() {
    this.loadingRules.set(true);
    this.icService.getReplenishmentRules().subscribe({
      next: (d) => { this.rules.set(d); this.loadingRules.set(false); },
      error: () => this.loadingRules.set(false),
    });
  }

  runCheck() {
    this.runningCheck.set(true);
    this.checkResult.set('');
    this.icService.runReplenishmentCheck().subscribe({
      next: (res) => {
        this.runningCheck.set(false);
        const parts: string[] = [];
        if (res.transferOrdersCreated) parts.push(`${res.transferOrdersCreated} Transfer Order(s) created`);
        if (res.purchaseOrdersCreated) parts.push(`${res.purchaseOrdersCreated} Purchase Order(s) raised`);
        if (res.skipped)               parts.push(`${res.skipped} skipped (TO/PO already in progress)`);
        this.checkResult.set(parts.length ? parts.join(' · ') : 'All items are sufficiently stocked.');
        this.loadRequests();
      },
      error: (err) => {
        this.runningCheck.set(false);
        this.checkResult.set(err.error?.message || 'Replenishment check failed.');
      }
    });
  }

  getVal(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  statusClass(s: number): string {
    switch (s) {
      case 1: return 'bg-blue-100 text-blue-700';
      case 2: return 'bg-green-100 text-green-700';
      case 3: return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  statusLabel(s: number): string {
    switch (s) {
      case 1: return 'Pending';
      case 2: return 'Converted';
      case 3: return 'Closed';
      default: return 'Unknown';
    }
  }
}
