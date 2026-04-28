import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PharmacistService } from '../../../core/services/pharmacist.service';
import { PharmacistDashboardStats } from '../../../core/models/pharmacist.model';

@Component({
  selector: 'app-pharmacist-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <!-- Page header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p class="text-gray-500 text-sm mt-1">Your pharmacy overview at a glance</p>
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <div class="flex flex-col items-center gap-3">
            <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-gray-500 text-sm">Loading dashboard...</p>
          </div>
        </div>
      }

      @if (!loading() && stats()) {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <!-- Total Stock Items -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Stock</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.totalStockItems }}</p>
            <p class="text-sm text-gray-500 mt-1">Total Stock Items</p>
          </div>

          <!-- Pending Incoming Transfers -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <span class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Pending</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.pendingIncomingTransfers }}</p>
            <p class="text-sm text-gray-500 mt-1">Pending Incoming Transfers</p>
          </div>

          <!-- Today's Dispenses -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span class="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">Today</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.todayDispenses }}</p>
            <p class="text-sm text-gray-500 mt-1">Today's Dispenses</p>
          </div>

        </div>

        <!-- Bottom panels -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Recent Dispenses -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 class="font-semibold text-gray-800">Recent Dispenses</h3>
              <a routerLink="/pharmacist/dispense" class="text-xs text-blue-600 hover:text-blue-700 font-medium">View all →</a>
            </div>
            <div class="divide-y divide-gray-50">
              @if (stats()!.recentDispenses.length === 0) {
                <div class="px-5 py-8 text-center">
                  <p class="text-gray-400 text-sm">No recent dispenses</p>
                </div>
              }
              @for (d of stats()!.recentDispenses; track d.dispenseRefId) {
                <div class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-800">{{ d.itemName }}</p>
                      <p class="text-xs text-gray-500">Qty: {{ d.quantity }} → {{ d.destination }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-gray-400">{{ d.dispenseDate | date:'MMM d, HH:mm' }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Incoming Transfer Summary -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 class="font-semibold text-gray-800">Incoming Transfer Summary</h3>
              <a routerLink="/pharmacist/transfers" class="text-xs text-blue-600 hover:text-blue-700 font-medium">View all →</a>
            </div>
            <div class="divide-y divide-gray-50">
              @if (stats()!.incomingTransferSummary.length === 0) {
                <div class="px-5 py-8 text-center">
                  <p class="text-gray-400 text-sm">No incoming transfers</p>
                </div>
              }
              @for (t of stats()!.incomingTransferSummary; track t.transferOrderId) {
                <div class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg class="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-800">TO #{{ t.transferOrderId }}</p>
                      <p class="text-xs text-gray-500">From: {{ t.fromLocation }} · {{ t.itemCount }} item(s)</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                      [class]="getTransferStatusClass(t.status)">
                      {{ t.status }}
                    </span>
                    <p class="text-xs text-gray-400 mt-0.5">{{ t.createdDate | date:'MMM d' }}</p>
                  </div>
                </div>
              }
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
export class PharmacistDashboardComponent implements OnInit {
  stats = signal<PharmacistDashboardStats | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(private pharmacistService: PharmacistService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.error.set('');
    this.pharmacistService.getDashboardStats().subscribe({
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

  getTransferStatusClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'pending') return 'bg-amber-100 text-amber-700';
    if (s === 'completed') return 'bg-green-100 text-green-700';
    if (s === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  }
}
