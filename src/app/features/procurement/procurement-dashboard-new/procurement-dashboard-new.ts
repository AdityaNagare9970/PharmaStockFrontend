import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-procurement-dashboard-new',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p class="text-gray-500 text-sm mt-1">Procurement overview</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

        <a routerLink="/procurement/vendors"
          class="bg-white rounded-xl shadow-sm border border-purple-100 p-6 hover:border-purple-300 transition-colors block">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-800">Vendor Management</p>
              <p class="text-sm text-gray-500">Manage suppliers</p>
            </div>
          </div>
        </a>

        <a routerLink="/procurement/purchase-orders"
          class="bg-white rounded-xl shadow-sm border border-purple-100 p-6 hover:border-purple-300 transition-colors block">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-800">Purchase Orders</p>
              <p class="text-sm text-gray-500">Create & manage POs</p>
            </div>
          </div>
        </a>

        <a routerLink="/procurement/goods-receipt"
          class="bg-white rounded-xl shadow-sm border border-purple-100 p-6 hover:border-purple-300 transition-colors block">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-800">Goods Receipt</p>
              <p class="text-sm text-gray-500">Record incoming stock</p>
            </div>
          </div>
        </a>

      </div>
    </div>
  `,
})
export class ProcurementDashboardNewComponent {}
