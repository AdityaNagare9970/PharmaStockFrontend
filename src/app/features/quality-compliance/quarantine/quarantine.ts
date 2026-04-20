import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QcoService } from '../../../core/services/qco.service';
import { QuarantineActionDTO, CreateQuarantineActionDTO } from '../../../core/models/qco.model';

@Component({
  selector: 'app-quarantine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Quarantine Actions</h2>
          <p class="text-gray-500 text-sm mt-0.5">Manage quarantined inventory lots</p>
        </div>
        <button
          (click)="openModal()"
          class="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-violet-700 transition-colors font-medium flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Quarantine
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-3">
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-amber-600 uppercase tracking-wide">Active</p>
          <p class="text-2xl font-bold text-amber-700 mt-1">{{ activeCount() }}</p>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-green-600 uppercase tracking-wide">Released</p>
          <p class="text-2xl font-bold text-green-700 mt-1">{{ releasedCount() }}</p>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-red-600 uppercase tracking-wide">Disposed</p>
          <p class="text-2xl font-bold text-red-700 mt-1">{{ disposedCount() }}</p>
        </div>
        <div class="bg-violet-50 border border-violet-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-violet-600 uppercase tracking-wide">Total</p>
          <p class="text-2xl font-bold text-violet-700 mt-1">{{ actions().length }}</p>
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
        } @else if (filtered().length === 0) {
          <div class="text-center py-12">
            <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <p class="text-gray-500 font-medium text-sm">No quarantine actions found</p>
            <p class="text-gray-400 text-xs mt-1">Add a new quarantine action to get started</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch #</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quarantine Date</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Released Date</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (a of filtered(); track a.quarantaineActionId) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-gray-500 text-xs">#{{ a.quarantaineActionId }}</td>
                    <td class="px-4 py-3 font-medium text-gray-800">{{ a.itemName }}</td>
                    <td class="px-4 py-3 text-gray-600">#{{ a.batchNumber }}</td>
                    <td class="px-4 py-3 text-gray-600 text-xs">{{ a.quarantineDate | date:'dd MMM yyyy' }}</td>
                    <td class="px-4 py-3 text-gray-600 max-w-xs truncate">{{ a.reason }}</td>
                    <td class="px-4 py-3 text-gray-500 text-xs">
                      {{ a.releasedDate ? (a.releasedDate | date:'dd MMM yyyy') : '—' }}
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        [class]="getStatusClass(a.status)">
                        {{ a.statusName }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      @if (a.status === 1) {
                        <div class="flex items-center gap-1.5">
                          <button
                            (click)="release(a.quarantaineActionId)"
                            [disabled]="releasing() === a.quarantaineActionId || disposing() === a.quarantaineActionId"
                            class="bg-green-600 text-white px-2.5 py-1 rounded-lg text-xs hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                          >
                            {{ releasing() === a.quarantaineActionId ? '...' : 'Release' }}
                          </button>
                          <button
                            (click)="dispose(a.quarantaineActionId)"
                            [disabled]="releasing() === a.quarantaineActionId || disposing() === a.quarantaineActionId"
                            class="bg-red-600 text-white px-2.5 py-1 rounded-lg text-xs hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                          >
                            {{ disposing() === a.quarantaineActionId ? '...' : 'Dispose' }}
                          </button>
                        </div>
                      } @else {
                        <span class="text-gray-300 text-xs">—</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            {{ filtered().length }} of {{ actions().length }} records
          </div>
        }
      </div>
    </div>

    <!-- Add Quarantine Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black bg-opacity-50" (click)="closeModal()"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800">Add Quarantine Action</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Inventory Lot ID</label>
              <input
                type="number"
                [value]="newLotId()"
                (input)="newLotId.set(getInputValueNum($event))"
                placeholder="Enter inventory lot ID"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
              <input
                type="text"
                [value]="newReason()"
                (input)="newReason.set(getInputValue($event))"
                placeholder="Enter quarantine reason"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            @if (modalError()) {
              <p class="text-red-600 text-sm">{{ modalError() }}</p>
            }
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              (click)="closeModal()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              (click)="submitQuarantine()"
              [disabled]="submitting()"
              class="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {{ submitting() ? 'Saving...' : 'Add Quarantine' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class QuarantineComponent implements OnInit {
  actions = signal<QuarantineActionDTO[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  showModal = signal(false);
  newLotId = signal<number | null>(null);
  newReason = signal('');
  submitting = signal(false);
  releasing = signal<number | null>(null);
  disposing = signal<number | null>(null);
  modalError = signal('');

  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    return this.actions().filter(
      (a) =>
        !term ||
        (a.itemName ?? '').toLowerCase().includes(term) ||
        a.batchNumber?.toString().includes(term)
    );
  });

  activeCount = computed(() => this.actions().filter((a) => a.status === 1).length);
  releasedCount = computed(() => this.actions().filter((a) => a.status === 2).length);
  disposedCount = computed(() => this.actions().filter((a) => a.status === 3).length);

  constructor(private qcoService: QcoService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.qcoService.getQuarantineActions().subscribe({
      next: (data) => { this.actions.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openModal() {
    this.newLotId.set(null);
    this.newReason.set('');
    this.modalError.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  submitQuarantine() {
    const lotId = this.newLotId();
    const reason = this.newReason().trim();
    if (!lotId || lotId <= 0) { this.modalError.set('Please enter a valid Inventory Lot ID.'); return; }
    if (!reason) { this.modalError.set('Please enter a reason.'); return; }

    this.submitting.set(true);
    this.modalError.set('');
    const dto: CreateQuarantineActionDTO = { inventoryLotId: lotId, reason };
    this.qcoService.createQuarantineAction(dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        this.submitting.set(false);
        this.modalError.set(err.error?.message || 'Failed to create quarantine action.');
      },
    });
  }

  release(id: number) {
    this.releasing.set(id);
    this.qcoService.releaseQuarantine(id).subscribe({
      next: () => { this.releasing.set(null); this.loadData(); },
      error: () => this.releasing.set(null),
    });
  }

  dispose(id: number) {
    this.disposing.set(id);
    this.qcoService.disposeQuarantine(id).subscribe({
      next: () => { this.disposing.set(null); this.loadData(); },
      error: () => this.disposing.set(null),
    });
  }

  getStatusClass(status: number): string {
    if (status === 1) return 'bg-amber-100 text-amber-700';
    if (status === 2) return 'bg-green-100 text-green-700';
    if (status === 3) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  getInputValueNum(event: Event): number | null {
    const v = (event.target as HTMLInputElement).value;
    return v ? Number(v) : null;
  }
}
