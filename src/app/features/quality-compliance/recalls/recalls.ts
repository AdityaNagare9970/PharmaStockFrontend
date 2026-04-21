import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QcoService } from '../../../core/services/qco.service';
import { RecallNoticeDTO, CreateRecallNoticeDTO } from '../../../core/models/qco.model';

@Component({
  selector: 'app-recalls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Recall Notices</h2>
          <p class="text-gray-500 text-sm mt-0.5">Drug recall notices and their status</p>
        </div>
        <button
          (click)="openModal()"
          class="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-violet-700 transition-colors font-medium flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Recall Notice
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-red-50 border border-red-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-red-600 uppercase tracking-wide">Active Recalls</p>
          <p class="text-2xl font-bold text-red-700 mt-1">{{ activeCount() }}</p>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-green-600 uppercase tracking-wide">Resolved</p>
          <p class="text-2xl font-bold text-green-700 mt-1">{{ resolvedCount() }}</p>
        </div>
        <div class="bg-violet-50 border border-violet-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-violet-600 uppercase tracking-wide">Total</p>
          <p class="text-2xl font-bold text-violet-700 mt-1">{{ notices().length }}</p>
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
            placeholder="Search by drug name..."
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-gray-500 font-medium text-sm">No recall notices found</p>
            <p class="text-gray-400 text-xs mt-1">Click "Add Recall Notice" to create one</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Drug</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notice Date</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (n of filtered(); track n.recallNoticeId) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-gray-500 text-xs">#{{ n.recallNoticeId }}</td>
                    <td class="px-4 py-3 font-medium text-gray-800">{{ n.drugName }}</td>
                    <td class="px-4 py-3 text-gray-600 text-xs">{{ n.noticeDate | date:'dd MMM yyyy' }}</td>
                    <td class="px-4 py-3 text-gray-600 max-w-xs truncate">{{ n.reason || '—' }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ n.actionName }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        [class]="n.status ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
                        {{ n.status ? 'Active' : 'Resolved' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      @if (n.status) {
                        <button
                          (click)="resolve(n.recallNoticeId)"
                          [disabled]="resolving() === n.recallNoticeId"
                          class="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                        >
                          {{ resolving() === n.recallNoticeId ? '...' : 'Resolve' }}
                        </button>
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
            {{ filtered().length }} of {{ notices().length }} records
          </div>
        }
      </div>
    </div>

    <!-- Add Recall Notice Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black bg-opacity-50" (click)="closeModal()"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800">New Recall Notice</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="px-6 py-5 space-y-4">

            <!-- Drug ID -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Drug ID</label>
              <input
                type="number"
                [value]="newDrugId()"
                (input)="newDrugId.set(getNum($event))"
                placeholder="Enter drug ID"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <!-- Reason -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
              <textarea
                [value]="newReason()"
                (input)="newReason.set(getVal($event))"
                rows="3"
                placeholder="Describe the reason for the recall..."
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              ></textarea>
            </div>

            <!-- Action -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Recall Action</label>
              <select
                [value]="newAction()"
                (change)="newAction.set(getNum($event))"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                <option [value]="0" disabled>— Select action —</option>
                <option [value]="1">Return to Supplier</option>
                <option [value]="2">Quarantine &amp; Investigate</option>
                <option [value]="3">Dispose</option>
              </select>
            </div>

            @if (modalError()) {
              <p class="text-red-600 text-sm bg-red-50 p-2.5 rounded-lg">{{ modalError() }}</p>
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
              (click)="submitRecall()"
              [disabled]="submitting()"
              class="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {{ submitting() ? 'Saving...' : 'Add Recall' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class RecallsComponent implements OnInit {
  notices   = signal<RecallNoticeDTO[]>([]);
  loading   = signal(true);
  searchTerm = signal('');
  showModal = signal(false);
  submitting = signal(false);
  resolving  = signal<number | null>(null);
  modalError = signal('');

  newDrugId = signal<number>(0);
  newReason = signal('');
  newAction = signal<number>(0);

  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    return this.notices().filter(
      (n) => !term || (n.drugName ?? '').toLowerCase().includes(term)
    );
  });

  activeCount   = computed(() => this.notices().filter((n) => n.status === true).length);
  resolvedCount = computed(() => this.notices().filter((n) => n.status === false).length);

  constructor(private qcoService: QcoService) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading.set(true);
    this.qcoService.getRecallNotices().subscribe({
      next: (data) => { this.notices.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openModal() {
    this.newDrugId.set(0);
    this.newReason.set('');
    this.newAction.set(0);
    this.modalError.set('');
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  submitRecall() {
    const drugId = this.newDrugId();
    const reason = this.newReason().trim();
    const action = this.newAction();
    if (!drugId || drugId <= 0) { this.modalError.set('Please enter a valid Drug ID.'); return; }
    if (!reason)                { this.modalError.set('Please enter a reason.'); return; }
    if (!action || action <= 0) { this.modalError.set('Please select an action.'); return; }

    this.submitting.set(true);
    this.modalError.set('');
    const dto: CreateRecallNoticeDTO = { drugId, reason, action };
    this.qcoService.createRecallNotice(dto).subscribe({
      next: () => { this.submitting.set(false); this.closeModal(); this.loadData(); },
      error: (err) => {
        this.submitting.set(false);
        this.modalError.set(err.error?.message || 'Failed to create recall notice.');
      },
    });
  }

  resolve(id: number) {
    this.resolving.set(id);
    this.qcoService.resolveRecall(id).subscribe({
      next: () => { this.resolving.set(null); this.loadData(); },
      error: () => this.resolving.set(null),
    });
  }

  getVal(event: Event): string { return (event.target as HTMLInputElement).value; }
  getNum(event: Event): number { return +(event.target as HTMLInputElement).value; }
}
