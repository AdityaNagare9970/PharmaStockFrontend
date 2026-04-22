import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QcoService } from '../../../core/services/qco.service';
import { RecallNoticeDTO } from '../../../core/models/qco.model';

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
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-red-50 border border-red-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-red-600 uppercase tracking-wide">Active Recalls</p>
          <p class="text-2xl font-bold text-red-700 mt-1">{{ activeCount() }}</p>
        </div>
        <div class="bg-violet-50 border border-violet-200 rounded-xl p-4">
          <p class="text-xs font-semibold text-violet-600 uppercase tracking-wide">Total Recalls</p>
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
            (input)="searchTerm.set(getInputValue($event))"
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
            <p class="text-gray-400 text-xs mt-1">No recalls match your search criteria</p>
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
  `,
})
export class RecallsComponent implements OnInit {
  notices = signal<RecallNoticeDTO[]>([]);
  loading = signal(true);
  searchTerm = signal('');

  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    return this.notices().filter(
      (n) => !term || (n.drugName ?? '').toLowerCase().includes(term)
    );
  });

  activeCount = computed(() => this.notices().filter((n) => n.status === true).length);

  constructor(private qcoService: QcoService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.qcoService.getRecallNotices().subscribe({
      next: (data) => { this.notices.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
