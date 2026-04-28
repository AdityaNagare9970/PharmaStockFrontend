import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacistService } from '../../../core/services/pharmacist.service';
import { IncomingTransferDTO } from '../../../core/models/pharmacist.model';

@Component({
  selector: 'app-incoming-transfers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 p-6">
      <!-- Header -->
      <div>
        <h2 class="text-xl font-bold text-gray-800">Incoming Transfers</h2>
        <p class="text-gray-500 text-sm mt-0.5">Transfer orders arriving at your location</p>
      </div>

      <!-- Stats row -->
      @if (!loading() && transfers().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ pendingCount() }}</p>
              <p class="text-xs text-gray-500">Pending Transfers</p>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ completedCount() }}</p>
              <p class="text-xs text-gray-500">Completed Transfers</p>
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
            placeholder="Search by order ID or from location..."
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
        } @else if (filteredTransfers().length === 0) {
          <div class="text-center py-12">
            <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p class="text-gray-500 font-medium text-sm">No incoming transfers found</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">ID</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">From Location</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created Date</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (t of filteredTransfers(); track t.transferOrderId) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-gray-600">#{{ t.transferOrderId }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-blue-400 rounded-full shrink-0"></div>
                        <span class="font-medium text-gray-800">{{ t.fromLocationName }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-500 text-xs">{{ t.createdDate | date:'dd MMM yyyy, HH:mm' }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        [class]="getStatusClass(t.status)">
                        {{ t.statusName }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <button
                        (click)="toggleExpand(t.transferOrderId)"
                        class="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                      >
                        {{ t.items.length }} item(s)
                        <svg class="w-3 h-3 transition-transform"
                          [class.rotate-180]="expandedId() === t.transferOrderId"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                    <td class="px-4 py-3">
                      @if (t.status === 1) {
                        <button
                          (click)="confirmTransfer(t.transferOrderId)"
                          [disabled]="confirmingId() === t.transferOrderId"
                          class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          @if (confirmingId() === t.transferOrderId) {
                            Confirming...
                          } @else {
                            Confirm Receipt
                          }
                        </button>
                      } @else if (t.status === 2) {
                        <button
                          (click)="receiveTransfer(t.transferOrderId)"
                          [disabled]="receivingId() === t.transferOrderId"
                          class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          @if (receivingId() === t.transferOrderId) {
                            Receiving...
                          } @else {
                            Mark as Received
                          }
                        </button>
                      }
                    </td>
                  </tr>
                  <!-- Expandable items row -->
                  @if (expandedId() === t.transferOrderId) {
                    <tr class="bg-blue-50">
                      <td colspan="6" class="px-6 py-3">
                        <div class="space-y-1">
                          <p class="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wider">Transfer Items</p>
                          @for (item of t.items; track item.transferItemId) {
                            <div class="flex items-center gap-4 bg-white rounded-lg px-4 py-2 border border-blue-100">
                              <span class="text-sm font-medium text-gray-800 flex-1">{{ item.itemName }}</span>
                              <span class="text-xs text-gray-500 font-mono">Batch: {{ item.batchNumber }}</span>
                              <span class="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                Qty: {{ item.quantity }}
                              </span>
                            </div>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
          <div class="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            {{ filteredTransfers().length }} of {{ transfers().length }} transfers
          </div>
        }
      </div>

      <!-- Confirm error toast -->
      @if (confirmError()) {
        <div class="fixed bottom-5 right-5 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50">
          {{ confirmError() }}
        </div>
      }
    </div>
  `,
})
export class IncomingTransfersComponent implements OnInit {
  transfers = signal<IncomingTransferDTO[]>([]);
  loading = signal(true);
  error = signal('');
  searchTerm = signal('');
  expandedId = signal<number | null>(null);
  confirmingId = signal<number | null>(null);
  receivingId  = signal<number | null>(null);
  confirmError = signal('');

  filteredTransfers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.transfers();
    return this.transfers().filter(
      (t) =>
        t.transferOrderId.toString().includes(term) ||
        t.fromLocationName.toLowerCase().includes(term)
    );
  });

  pendingCount = computed(() => this.transfers().filter((t) => t.status === 1 || t.status === 2).length);
  completedCount = computed(() => this.transfers().filter((t) => t.status === 3).length);

  constructor(private pharmacistService: PharmacistService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set('');
    this.pharmacistService.getIncomingTransfers().subscribe({
      next: (data) => {
        this.transfers.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Could not reach server');
        this.loading.set(false);
      },
    });
  }

  toggleExpand(id: number) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  confirmTransfer(transferOrderId: number) {
    this.confirmError.set('');
    this.confirmingId.set(transferOrderId);
    this.pharmacistService.confirmTransfer(transferOrderId).subscribe({
      next: () => {
        this.confirmingId.set(null);
        this.expandedId.set(null);
        this.loadData();
      },
      error: (err) => {
        this.confirmError.set(err.error?.message || 'Failed to confirm transfer');
        this.confirmingId.set(null);
        setTimeout(() => this.confirmError.set(''), 4000);
      },
    });
  }

  receiveTransfer(transferOrderId: number) {
    this.confirmError.set('');
    this.receivingId.set(transferOrderId);
    this.pharmacistService.receiveTransfer(transferOrderId).subscribe({
      next: () => {
        this.receivingId.set(null);
        this.expandedId.set(null);
        this.loadData();
      },
      error: (err) => {
        this.confirmError.set(err.error?.message || 'Failed to receive transfer');
        this.receivingId.set(null);
        setTimeout(() => this.confirmError.set(''), 4000);
      }
    });
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'bg-amber-100 text-amber-700';
      case 2: return 'bg-green-100 text-green-700';
      case 3: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}
