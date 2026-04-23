import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QualityService } from '../../../core/services/quality.service';
import { RecallNotice } from '../../../core/models/quality.model';

@Component({
  selector: 'app-recalls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Recall Registry</h2>
        <p class="text-gray-500 text-sm mt-1">Manage drug recall notices and actions</p>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm border border-red-100 p-4 flex items-center gap-4">
          <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-red-600">{{ openCount() }}</p>
            <p class="text-sm text-gray-500">Open Recalls</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-800">{{ closedCount() }}</p>
            <p class="text-sm text-gray-500">Closed Recalls</p>
          </div>
        </div>
      </div>

      <!-- Filter -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <input
          [(ngModel)]="searchTerm"
          type="text"
          placeholder="Search by drug name or reason..."
          class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        />
        <select
          [(ngModel)]="filterStatus"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
        <button (click)="loadData()" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">
          Refresh
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <div class="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-4">
          <p class="text-red-700 text-sm">{{ error() }}</p>
        </div>
      }

      @if (!loading() && !error()) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Recall ID</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Drug</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Notice Date</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (recall of filteredRecalls(); track recall.recallId) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-gray-800">#{{ recall.recallId }}</td>
                    <td class="px-4 py-3 text-gray-800 font-medium">{{ recall.drugName }}</td>
                    <td class="px-4 py-3 text-gray-500">{{ recall.noticeDate | date:'dd MMM yyyy' }}</td>
                    <td class="px-4 py-3 text-gray-600 max-w-xs truncate">{{ recall.reason }}</td>
                    <td class="px-4 py-3">
                      <span [class]="getActionClass(recall.action)">{{ recall.action }}</span>
                    </td>
                    <td class="px-4 py-3">
                      @if (recall.status === 'Open') {
                        <span class="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Open</span>
                      } @else {
                        <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Closed</span>
                      }
                    </td>
                    <td class="px-4 py-3">
                      @if (recall.status === 'Open') {
                        <button
                          (click)="closeRecall(recall)"
                          class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition-colors"
                        >
                          Close
                        </button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-4 py-12 text-center text-gray-400">No recall notices found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-2 text-right">{{ filteredRecalls().length }} records</p>
      }
    </div>
  `,
})
export class RecallsComponent implements OnInit {
  recalls = signal<RecallNotice[]>([]);
  loading = signal(true);
  error = signal('');
  searchTerm = '';
  filterStatus = '';

  filteredRecalls = computed(() => {
    let result = this.recalls();
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(r => r.drugName?.toLowerCase().includes(t) || r.reason?.toLowerCase().includes(t));
    }
    if (this.filterStatus) result = result.filter(r => r.status === this.filterStatus);
    return result;
  });

  openCount = computed(() => this.recalls().filter(r => r.status === 'Open').length);
  closedCount = computed(() => this.recalls().filter(r => r.status === 'Closed').length);

  constructor(private qualityService: QualityService) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading.set(true);
    this.error.set('');
    this.qualityService.getRecalls().subscribe({
      next: (data) => { this.recalls.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Could not load recalls'); this.loading.set(false); }
    });
  }

  closeRecall(recall: RecallNotice) {
    this.qualityService.closeRecall(recall.recallId).subscribe({
      next: () => this.loadData(),
      error: (err) => alert(err.error?.message || 'Failed to close recall')
    });
  }

  getActionClass(action: string): string {
    const base = 'text-xs px-2 py-1 rounded-full font-medium ';
    if (action === 'Quarantine') return base + 'bg-purple-100 text-purple-700';
    if (action === 'Return') return base + 'bg-blue-100 text-blue-700';
    if (action === 'Dispose') return base + 'bg-red-100 text-red-700';
    return base + 'bg-gray-100 text-gray-700';
  }
}
