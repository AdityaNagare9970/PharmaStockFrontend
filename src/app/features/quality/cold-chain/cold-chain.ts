import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QualityService } from '../../../core/services/quality.service';
import { ColdChainLog } from '../../../core/models/quality.model';

@Component({
  selector: 'app-cold-chain',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Temperature Logs</h2>
        <p class="text-gray-500 text-sm mt-1">Monitor cold chain compliance and excursion flags</p>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-800">{{ normalCount() }}</p>
            <p class="text-sm text-gray-500">Normal Readings</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-orange-100 p-4 flex items-center gap-4">
          <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-orange-600">{{ excursionCount() }}</p>
            <p class="text-sm text-gray-500">Excursions</p>
          </div>
        </div>
      </div>

      <!-- Filter -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <input
          [(ngModel)]="searchTerm"
          type="text"
          placeholder="Search by location or sensor..."
          class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        />
        <select
          [(ngModel)]="filterStatus"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          <option value="">All Status</option>
          <option value="Normal">Normal</option>
          <option value="Excursion">Excursion</option>
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
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Log ID</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sensor ID</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Temp (°C)</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (log of filteredLogs(); track log.logId) {
                  <tr class="hover:bg-gray-50 transition-colors" [class.bg-orange-50]="log.status === 'Excursion'">
                    <td class="px-4 py-3 font-medium text-gray-800">#{{ log.logId }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ log.locationName || 'Location ' + log.locationId }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ log.sensorId }}</td>
                    <td class="px-4 py-3 text-gray-500">{{ log.timestamp | date:'dd MMM yyyy HH:mm' }}</td>
                    <td class="px-4 py-3">
                      <span [class]="log.temperatureC > 8 ? 'font-bold text-orange-600' : 'text-gray-800'">
                        {{ log.temperatureC }}°C
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      @if (log.status === 'Excursion') {
                        <span class="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                          </svg>
                          Excursion
                        </span>
                      } @else {
                        <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Normal</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-4 py-12 text-center text-gray-400">No temperature logs found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-2 text-right">{{ filteredLogs().length }} records</p>
      }
    </div>
  `,
})
export class ColdChainComponent implements OnInit {
  logs = signal<ColdChainLog[]>([]);
  loading = signal(true);
  error = signal('');
  searchTerm = '';
  filterStatus = '';

  filteredLogs = computed(() => {
    let result = this.logs();
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(l =>
        l.locationName?.toLowerCase().includes(t) ||
        l.sensorId?.toLowerCase().includes(t)
      );
    }
    if (this.filterStatus) result = result.filter(l => l.status === this.filterStatus);
    return result;
  });

  normalCount = computed(() => this.logs().filter(l => l.status === 'Normal').length);
  excursionCount = computed(() => this.logs().filter(l => l.status === 'Excursion').length);

  constructor(private qualityService: QualityService) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading.set(true);
    this.error.set('');
    this.qualityService.getColdChainLogs().subscribe({
      next: (data) => { this.logs.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Could not load temperature logs'); this.loading.set(false); }
    });
  }
}
