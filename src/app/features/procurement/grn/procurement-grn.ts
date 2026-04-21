import { Component } from '@angular/core';

@Component({
  selector: 'app-procurement-grn',
  standalone: true,
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Goods Receipt Notes (GRN)</h2>
        <p class="text-gray-500 text-sm mt-1">Record and review received goods</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
        <p class="text-gray-500 text-sm">GRN module coming soon</p>
      </div>
    </div>
  `,
})
export class ProcurementGrnComponent {}
