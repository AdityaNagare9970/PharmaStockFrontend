import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="fixed inset-y-0 left-0 w-64 bg-gray-900 flex flex-col z-10">
      <!-- Brand -->
      <div class="flex items-center justify-center h-16 px-4 border-b border-gray-700 shrink-0">
        <span class="text-white text-xl font-bold tracking-wide">PharmaStock</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <a
          routerLink="/dashboard"
          routerLinkActive
          #dashLink="routerLinkActive"
          [routerLinkActiveOptions]="{ exact: true }"
          [class]="
            dashLink.isActive
              ? 'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white'
              : 'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors'
          "
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Dashboard
        </a>

        <a
          routerLink="/drugs"
          routerLinkActive
          #drugsLink="routerLinkActive"
          [class]="
            drugsLink.isActive
              ? 'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white'
              : 'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors'
          "
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          Drugs
        </a>
      </nav>
    </aside>
  `,
})
export class SidebarComponent {}
