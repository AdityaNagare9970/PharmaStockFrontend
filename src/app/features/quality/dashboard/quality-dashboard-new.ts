import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QualityService } from '../../../core/services/quality.service';
import { QualityDashboardStats } from '../../../core/models/quality.model';

@Component({
  selector: 'app-quality-dashboard-new',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p class="text-gray-500 text-sm mt-1">Quality & Compliance overview</p>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <div class="flex flex-col items-center gap-3">
            <div class="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-gray-500 text-sm">Loading dashboard...</p>
          </div>
        </div>
      }

      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p class="text-red-700 text-sm">{{ error() }}</p>
        </div>
      }

      @if (!loading() && stats()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <!-- Active Excursions -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <span class="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">Cold Chain</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.activeExcursions }}</p>
            <p class="text-sm text-gray-500 mt-1">Active Excursions</p>
          </div>

          <!-- Open Recalls -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span class="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">Recalls</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.openRecalls }}</p>
            <p class="text-sm text-gray-500 mt-1">Open Recalls</p>
          </div>

          <!-- Quarantined Lots -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <span class="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">Quarantine</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.quarantinedLots }}</p>
            <p class="text-sm text-gray-500 mt-1">Quarantined Lots</p>
          </div>

          <!-- Audit Events Today -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Audit</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.auditEventsToday }}</p>
            <p class="text-sm text-gray-500 mt-1">Audit Events Today</p>
          </div>

        </div>

        <!-- Quick links -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a routerLink="/quality/cold-chain"
            class="bg-white rounded-xl shadow-sm border border-orange-100 p-5 hover:border-orange-300 transition-colors cursor-pointer block">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-800 text-sm">Temperature Logs</p>
                <p class="text-xs text-gray-500">View cold chain records</p>
              </div>
            </div>
          </a>

          <a routerLink="/quality/recalls"
            class="bg-white rounded-xl shadow-sm border border-red-100 p-5 hover:border-red-300 transition-colors cursor-pointer block">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-800 text-sm">Recall Registry</p>
                <p class="text-xs text-gray-500">Manage drug recalls</p>
              </div>
            </div>
          </a>

          <a routerLink="/quality/quarantine"
            class="bg-white rounded-xl shadow-sm border border-purple-100 p-5 hover:border-purple-300 transition-colors cursor-pointer block">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-800 text-sm">Quarantine Actions</p>
                <p class="text-xs text-gray-500">Release or dispose lots</p>
              </div>
            </div>
          </a>
        </div>
      }
    </div>
  `,
})
export class QualityDashboardNewComponent implements OnInit {
  stats = signal<QualityDashboardStats | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(private qualityService: QualityService) {}

  ngOnInit() {
    this.qualityService.getDashboardStats().subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Could not load stats'); this.loading.set(false); }
    });
  }
}
