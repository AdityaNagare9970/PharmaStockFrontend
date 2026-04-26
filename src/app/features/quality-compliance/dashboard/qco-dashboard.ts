import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QcoService } from '../../../core/services/qco.service';
import { QCODashboardStats } from '../../../core/models/qco.model';

@Component({
  selector: 'app-qco-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <!-- Page header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p class="text-gray-500 text-sm mt-1">Quality &amp; compliance overview at a glance</p>
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <div class="flex flex-col items-center gap-3">
            <div class="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-gray-500 text-sm">Loading dashboard...</p>
          </div>
        </div>
      }

      @if (!loading() && stats()) {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <!-- Active Quarantines -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <span class="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full font-medium">Quarantine</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.activeQuarantines }}</p>
            <p class="text-sm text-gray-500 mt-1">Active Quarantines</p>
          </div>

          <!-- Audit Events Today -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span class="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">Today</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.auditEventsToday }}</p>
            <p class="text-sm text-gray-500 mt-1">Audit Events Today</p>
          </div>

<!-- Recent Adjustments -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Adjustments</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.recentAdjustmentsCount }}</p>
            <p class="text-sm text-gray-500 mt-1">Recent Adjustments</p>
          </div>
        </div>

        <!-- Bottom panels -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Recent Quarantines -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 class="font-semibold text-gray-800">Recent Quarantines</h3>
              <a routerLink="/qco/quarantine" class="text-xs text-violet-600 hover:text-violet-700 font-medium">View all →</a>
            </div>
            <div class="divide-y divide-gray-50">
              @if (stats()!.recentQuarantines.length === 0) {
                <div class="px-5 py-8 text-center">
                  <p class="text-gray-400 text-sm">No recent quarantine actions</p>
                </div>
              }
              @for (q of stats()!.recentQuarantines; track q.quarantaineActionId) {
                <div class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg class="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-800">{{ q.itemName }}</p>
                      <p class="text-xs text-gray-500">Batch #{{ q.batchNumber }} — {{ q.reason }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="inline-block text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                      {{ q.status }}
                    </span>
                    <p class="text-xs text-gray-400 mt-0.5">{{ q.quarantineDate | date:'MMM d' }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Quick Links -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="px-5 py-4 border-b border-gray-100">
              <h3 class="font-semibold text-gray-800">Quick Actions</h3>
            </div>
            <div class="p-5 grid grid-cols-1 gap-3">
              <a routerLink="/qco/quarantine"
                class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-violet-50 hover:border-violet-200 transition-colors">
                <div class="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-700">Manage Quarantine</span>
              </a>
              <a routerLink="/qco/adjustments"
                class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-700">Stock Adjustments</span>
              </a>
              <a routerLink="/qco/expiry"
                class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-amber-50 hover:border-amber-200 transition-colors">
                <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-700">Expiry Watch</span>
              </a>
            </div>
          </div>
        </div>
      }

      <!-- Error state -->
      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-700 font-medium">Failed to load dashboard data</p>
          <p class="text-red-500 text-sm mt-1">{{ error() }}</p>
          <button
            (click)="loadStats()"
            class="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      }
    </div>
  `,
})
export class QcoDashboardComponent implements OnInit {
  stats = signal<QCODashboardStats | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(private qcoService: QcoService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.error.set('');
    this.qcoService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Could not reach server');
        this.loading.set(false);
      },
    });
  }
}
