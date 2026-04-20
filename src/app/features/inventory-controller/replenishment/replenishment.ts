import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryControllerService } from '../../../core/services/inventory-controller.service';
import {
  ReplenishmentRequest,
  ReplenishmentRule,
  PharmLocation,
  ItemLookup,
} from '../../../core/models/inventory-controller.model';

@Component({
  selector: 'app-replenishment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">

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
              (click)="openCreateModal()"
              class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Request
            </button>
          }
        </div>
      </div>

      <!-- ── CREATE REQUEST MODAL ── -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

            <!-- Modal header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 class="text-lg font-bold text-gray-800">New Replenishment Request</h3>
                <p class="text-xs text-gray-400 mt-0.5">Fill in the details to raise a request</p>
              </div>
              <button (click)="closeCreateModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal body -->
            <div class="px-6 py-5 space-y-4">

              <!-- Item selector -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                  Item / Drug <span class="text-red-500">*</span>
                </label>
                <select
                  [value]="newItemId()"
                  (change)="newItemId.set(+getVal($event))"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="0" disabled>— Select an item —</option>
                  @for (item of items(); track item.itemId) {
                    <option [value]="item.itemId">
                      {{ item.name }}{{ item.strength ? ' · ' + item.strength : '' }}
                    </option>
                  }
                </select>
              </div>

              <!-- Location selector -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                  Requesting Location <span class="text-red-500">*</span>
                </label>
                <select
                  [value]="newLocationId()"
                  (change)="onLocationChange(+getVal($event))"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="0" disabled>— Select a location —</option>
                  @for (loc of locations(); track loc.locationId) {
                    <option [value]="loc.locationId">{{ loc.name }}</option>
                  }
                </select>
              </div>

              <!-- Rule selector (auto-filters by location) -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                  Replenishment Rule <span class="text-red-500">*</span>
                </label>
                @if (filteredRules().length === 0 && newLocationId()) {
                  <p class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    No rules configured for this location. Select a different location or ask admin to create a rule.
                  </p>
                } @else {
                  <select
                    [value]="newRuleId()"
                    (change)="newRuleId.set(+getVal($event))"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    [disabled]="filteredRules().length === 0"
                  >
                    <option value="0" disabled>— Select a rule —</option>
                    @for (rule of filteredRules(); track rule.replenishmentRuleId) {
                      <option [value]="rule.replenishmentRuleId">
                        Rule #{{ rule.replenishmentRuleId }} · Min {{ rule.minLevel }} / Par {{ rule.parLevel }} / Max {{ rule.maxLevel }}
                      </option>
                    }
                  </select>
                }
              </div>

              <!-- Quantity -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                  Suggested Quantity <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    type="number"
                    [value]="newSuggestedQty()"
                    (input)="newSuggestedQty.set(+getVal($event))"
                    min="1"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g. 50"
                  />
                  @if (parLevelHint()) {
                    <p class="text-xs text-teal-600 mt-1">
                      Suggested based on par level: <strong>{{ parLevelHint() }}</strong> units
                    </p>
                  }
                </div>
              </div>

              @if (createError()) {
                <div class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-red-700 text-sm">
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ createError() }}
                </div>
              }
            </div>

            <!-- Modal footer -->
            <div class="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                (click)="closeCreateModal()"
                class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                (click)="submitRequest()"
                [disabled]="creating() || !newItemId() || !newLocationId() || !newRuleId() || !newSuggestedQty()"
                class="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                @if (creating()) {
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Submitting...
                } @else {
                  Raise Request
                }
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ── REQUESTS TAB ── -->
      @if (activeTab() === 'requests') {

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide">Pending</p>
            <p class="text-2xl font-bold text-blue-700 mt-1">{{ pendingCount() }}</p>
          </div>
          <div class="bg-green-50 border border-green-200 rounded-xl p-4">
            <p class="text-xs font-semibold text-green-600 uppercase tracking-wide">Approved</p>
            <p class="text-2xl font-bold text-green-700 mt-1">{{ approvedCount() }}</p>
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
              <p class="text-gray-400 text-sm mt-1">Click <strong>Add Request</strong> above to raise one</p>
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
                      <td class="px-4 py-3 font-medium text-gray-800">
                        {{ itemName(req.itemId) || req.itemName || ('Item #' + req.itemId) }}
                      </td>
                      <td class="px-4 py-3 text-gray-600">{{ locationName(req.locationId) }}</td>
                      <td class="px-4 py-3 font-bold text-teal-700">{{ req.suggestedQty }}</td>
                      <td class="px-4 py-3 text-gray-400 text-xs">{{ req.createdDate | date:'dd MMM yyyy' }}</td>
                      <td class="px-4 py-3">
                        <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                          [class]="statusClass(req.status)">
                          {{ req.statusName || statusLabel(req.status) }}
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
                      <td class="px-4 py-3 font-medium text-gray-800">
                        {{ itemName(rule.itemId) || rule.itemName || ('Item #' + rule.itemId) }}
                      </td>
                      <td class="px-4 py-3 text-gray-600">{{ locationName(rule.locationId) }}</td>
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
  requests = signal<ReplenishmentRequest[]>([]);
  rules = signal<ReplenishmentRule[]>([]);
  locations = signal<PharmLocation[]>([]);
  items = signal<ItemLookup[]>([]);
  loading = signal(true);
  loadingRules = signal(false);
  activeTab = signal<'requests' | 'rules'>('requests');
  searchTerm = signal('');

  showCreateModal = signal(false);
  creating = signal(false);
  createError = signal('');

  // Use signals so computed() tracks changes
  newItemId = signal(0);
  newLocationId = signal(0);
  newRuleId = signal(0);
  newSuggestedQty = signal(0);

  // Rules filtered by selected location for the modal dropdown
  filteredRules = computed(() =>
    this.newLocationId()
      ? this.rules().filter((r) => r.locationId === this.newLocationId())
      : this.rules()
  );

  
  // Auto-suggest qty from selected rule's par level
  parLevelHint = computed(() => {
    const rule = this.rules().find((r) => r.replenishmentRuleId === this.newRuleId());
    return rule ? rule.parLevel : null;
  });

  filteredRequests = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.requests();
    return this.requests().filter((r) => {
      const loc = this.locationName(r.locationId).toLowerCase();
      const itm = (this.itemName(r.itemId) || r.itemName || '').toLowerCase();
      return itm.includes(term) || loc.includes(term);
    });
  });

  pendingCount = computed(() => this.requests().filter((r) => r.status === 1).length);
  approvedCount = computed(() => this.requests().filter((r) => r.status === 2).length);

  constructor(private icService: InventoryControllerService) {}

  ngOnInit() {
    this.icService.getLocations().subscribe({ next: (l) => this.locations.set(l) });
    this.icService.getItemsLookup().subscribe({
      next: (i) => this.items.set(i),
      error: (err) => console.error('items-lookup failed:', err),
    });
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

  openCreateModal() {
    this.newItemId.set(0);
    this.newLocationId.set(0);
    this.newRuleId.set(0);
    this.newSuggestedQty.set(0);
    this.createError.set('');
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
    this.createError.set('');
  }

  onLocationChange(locId: number) {
    this.newLocationId.set(locId);
    this.newRuleId.set(0); // reset rule when location changes
  }

  submitRequest() {
    this.createError.set('');
    const itemId = this.newItemId();
    const locationId = this.newLocationId();
    const ruleId = this.newRuleId();
    const suggestedQty = this.newSuggestedQty();
    if (!itemId || !locationId || !ruleId || !suggestedQty) {
      this.createError.set('All fields are required.');
      return;
    }
    if (suggestedQty <= 0) {
      this.createError.set('Quantity must be greater than 0.');
      return;
    }
    this.creating.set(true);
    this.icService.createReplenishmentRequest({ itemId, locationId, ruleId, suggestedQty }).subscribe({
      next: () => {
        this.creating.set(false);
        this.closeCreateModal();
        this.loadRequests();
      },
      error: (err) => {
        this.createError.set(err.error?.message || 'Failed to submit request');
        this.creating.set(false);
      },
    });
  }

  locationName(id: number): string {
    return this.locations().find((l) => l.locationId === id)?.name ?? `Location #${id}`;
  }

  itemName(id: number): string {
    return this.items().find((i) => i.itemId === id)?.name ?? '';
  }

  getVal(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  statusClass(s: number): string {
    switch (s) {
      case 1: return 'bg-blue-100 text-blue-700';
      case 2: return 'bg-green-100 text-green-700';
      case 3: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  statusLabel(s: number): string {
    switch (s) {
      case 1: return 'Pending';
      case 2: return 'Approved';
      case 3: return 'Rejected';
      default: return 'Unknown';
    }
  }
}
