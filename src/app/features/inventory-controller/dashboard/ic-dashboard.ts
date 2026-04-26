import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryControllerService } from '../../../core/services/inventory-controller.service';
import { InventoryDashboardStats } from '../../../core/models/inventory-controller.model';

@Component({
  selector: 'app-ic-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <!-- Page header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p class="text-gray-500 text-sm mt-1">Inventory overview at a glance</p>
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <div class="flex flex-col items-center gap-3">
            <div class="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-gray-500 text-sm">Loading dashboard...</p>
          </div>
        </div>
      }

      @if (!loading() && stats()) {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <!-- Total Lots -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span class="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-medium">Lots</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.totalInventoryLots }}</p>
            <p class="text-sm text-gray-500 mt-1">Total Inventory Lots</p>
          </div>

<!-- Expired -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span class="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">Critical</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.expiredItems }}</p>
            <p class="text-sm text-gray-500 mt-1">Expired Items</p>
          </div>

          <!-- Open Transfers -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Transfers</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.openTransferOrders }}</p>
            <p class="text-sm text-gray-500 mt-1">Open Transfer Orders</p>
          </div>

          <!-- Pending Replenishments -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span class="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">Pending</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.pendingReplenishments }}</p>
            <p class="text-sm text-gray-500 mt-1">Pending Replenishments</p>
          </div>

<!-- Low Stock -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <span class="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-medium">Low</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.lowStockItems }}</p>
            <p class="text-sm text-gray-500 mt-1">Low Stock Items</p>
          </div>

          <!-- Total Locations -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span class="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">Locations</span>
            </div>
            <p class="text-3xl font-bold text-gray-800">{{ stats()!.totalLocations }}</p>
            <p class="text-sm text-gray-500 mt-1">Total Locations</p>
          </div>
        </div>

        <!-- Bottom panels -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Recent Transfers -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 class="font-semibold text-gray-800">Recent Transfer Orders</h3>
              <a routerLink="/ic/transfer-orders" class="text-xs text-teal-600 hover:text-teal-700 font-medium">View all →</a>
            </div>
            <div class="divide-y divide-gray-50">
              @if (stats()!.recentTransfers.length === 0) {
                <div class="px-5 py-8 text-center">
                  <p class="text-gray-400 text-sm">No recent transfer orders</p>
                </div>
              }
              @for (transfer of stats()!.recentTransfers; track transfer.transferOrderId) {
                <div class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-800">TO #{{ transfer.transferOrderId }}</p>
                      <p class="text-xs text-gray-500">{{ transfer.fromLocation }} → {{ transfer.toLocation }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                      [class]="getStatusClass(transfer.status)">
                      {{ transfer.status }}
                    </span>
                    <p class="text-xs text-gray-400 mt-0.5">{{ transfer.createdDate | date:'MMM d' }}</p>
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
export class IcDashboardComponent implements OnInit {
  stats = signal<InventoryDashboardStats | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(private icService: InventoryControllerService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.error.set('');
    this.icService.getDashboardStats().subscribe({
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

  getStatusClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'open' || s === 'pending') return 'bg-blue-100 text-blue-700';
    if (s === 'completed' || s === 'approved') return 'bg-green-100 text-green-700';
    if (s === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  }
}
