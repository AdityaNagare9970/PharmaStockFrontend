import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QualityService } from '../../../core/services/quality.service';
import { QuarantineAction } from '../../../core/models/quality.model';

@Component({
  selector: 'app-quarantine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Quarantine Management</h2>
        <p class="text-gray-500 text-sm mt-1">Review and act on quarantined inventory lots</p>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm border border-purple-100 p-4 flex items-center gap-4">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-purple-600">{{ quarantinedCount() }}</p>
            <p class="text-sm text-gray-500">Quarantined</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-green-100 p-4 flex items-center gap-4">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-800">{{ releasedCount() }}</p>
            <p class="text-sm text-gray-500">Released</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-800">{{ disposedCount() }}</p>
            <p class="text-sm text-gray-500">Disposed</p>
          </div>
        </div>
      </div>

      <!-- Filter -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <input
          [(ngModel)]="searchTerm"
          type="text"
          placeholder="Search by item name or batch..."
          class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        />
        <select
          [(ngModel)]="filterStatus"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          <option value="">All Status</option>
          <option value="Quarantined">Quarantined</option>
          <option value="Released">Released</option>
          <option value="Disposed">Disposed</option>
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
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">QA ID</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Batch</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quarantine Date</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (qa of filteredItems(); track qa.qaId) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-gray-800">#{{ qa.qaId }}</td>
                    <td class="px-4 py-3 text-gray-800 font-medium">{{ qa.itemName }}</td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ qa.batchNumber }}</td>
                    <td class="px-4 py-3 text-gray-500">{{ qa.quarantineDate | date:'dd MMM yyyy' }}</td>
                    <td class="px-4 py-3 text-gray-600 max-w-xs truncate">{{ qa.reason }}</td>
                    <td class="px-4 py-3">
                      <span [class]="getStatusClass(qa.status)">{{ qa.status }}</span>
                    </td>
                    <td class="px-4 py-3">
                      @if (qa.status === 'Quarantined') {
                        <div class="flex gap-2">
                          <button
                            (click)="releaseItem(qa)"
                            class="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-lg transition-colors"
                          >Release</button>
                          <button
                            (click)="disposeItem(qa)"
                            class="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-lg transition-colors"
                          >Dispose</button>
                        </div>
                      } @else {
                        <span class="text-xs text-gray-400">—</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-4 py-12 text-center text-gray-400">No quarantine records found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-2 text-right">{{ filteredItems().length }} records</p>
      }
    </div>
  `,
})
export class QuarantineComponent implements OnInit {
  items = signal<QuarantineAction[]>([]);
  loading = signal(true);
  error = signal('');
  searchTerm = '';
  filterStatus = '';

  filteredItems = computed(() => {
    let result = this.items();
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(q => q.itemName?.toLowerCase().includes(t) || q.batchNumber?.toLowerCase().includes(t));
    }
    if (this.filterStatus) result = result.filter(q => q.status === this.filterStatus);
    return result;
  });

  quarantinedCount = computed(() => this.items().filter(q => q.status === 'Quarantined').length);
  releasedCount = computed(() => this.items().filter(q => q.status === 'Released').length);
  disposedCount = computed(() => this.items().filter(q => q.status === 'Disposed').length);

  constructor(private qualityService: QualityService) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading.set(true);
    this.error.set('');
    this.qualityService.getQuarantineActions().subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Could not load quarantine records'); this.loading.set(false); }
    });
  }

  releaseItem(qa: QuarantineAction) {
    this.qualityService.releaseQuarantine(qa.qaId).subscribe({
      next: () => this.loadData(),
      error: (err) => alert(err.error?.message || 'Failed to release')
    });
  }

  disposeItem(qa: QuarantineAction) {
    this.qualityService.disposeQuarantine(qa.qaId).subscribe({
      next: () => this.loadData(),
      error: (err) => alert(err.error?.message || 'Failed to dispose')
    });
  }

  getStatusClass(status: string): string {
    const base = 'text-xs px-2 py-1 rounded-full font-medium ';
    if (status === 'Quarantined') return base + 'bg-purple-100 text-purple-700';
    if (status === 'Released') return base + 'bg-green-100 text-green-700';
    if (status === 'Disposed') return base + 'bg-gray-100 text-gray-600';
    return base + 'bg-gray-100 text-gray-700';
  }
}
