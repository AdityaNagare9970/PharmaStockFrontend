import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-qco-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">

    
      <!-- Sidebar -->
      <aside
        [class]="sidebarOpen()
          ? 'fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-violet-900 to-purple-800 flex flex-col transition-transform duration-300 translate-x-0'
          : 'fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-violet-900 to-purple-800 flex flex-col transition-transform duration-300 -translate-x-full lg:translate-x-0'"
      >

        <!-- Brand -->
        <div class="flex items-center justify-between h-16 px-5 border-b border-violet-700 shrink-0">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p class="text-white pt-2 text-sm font-bold leading-none">PharmaStock</p>
              <p class="text-violet-300 text-xs leading-none">Quality &amp; Compliance</p>
            </div>
          </div>
          <button (click)="sidebarOpen.set(false)" class="lg:hidden text-violet-300 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Role badge -->
        <div class="mx-4 mt-4 mb-2 px-3 py-2 bg-violet-800 bg-opacity-60 rounded-lg border border-violet-700">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 bg-violet-500 rounded-full flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-white text-xs font-medium truncate">Quality &amp; Compliance Officer</p>
              <p class="text-violet-300 text-xs truncate">Role 4</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p class="px-3 py-1.5 text-violet-400 text-xs font-semibold uppercase tracking-wider">Main</p>

          <a
            routerLink="/qco/dashboard"
            routerLinkActive #dashLink="routerLinkActive"
            [routerLinkActiveOptions]="{ exact: true }"
            [class]="dashLink.isActive ? activeClass : inactiveClass"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 11a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-8z" />
            </svg>
            Dashboard
          </a>

          <p class="px-3 py-1.5 text-violet-400 text-xs font-semibold uppercase tracking-wider mt-2">Quality Control</p>

          <a
            routerLink="/qco/quarantine"
            routerLinkActive #quarantineLink="routerLinkActive"
            [class]="quarantineLink.isActive ? activeClass : inactiveClass"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Quarantine
          </a>

          <a
            routerLink="/qco/recalls"
            routerLinkActive #recallsLink="routerLinkActive"
            [class]="recallsLink.isActive ? activeClass : inactiveClass"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Recall Notices
          </a>

          <p class="px-3 py-1.5 text-violet-400 text-xs font-semibold uppercase tracking-wider mt-2">Inventory</p>

          <a
            routerLink="/qco/adjustments"
            routerLinkActive #adjLink="routerLinkActive"
            [class]="adjLink.isActive ? activeClass : inactiveClass"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Stock Adjustments
          </a>

          <a
            routerLink="/qco/expiry"
            routerLinkActive #expiryLink="routerLinkActive"
            [class]="expiryLink.isActive ? activeClass : inactiveClass"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Expiry Watch
            <span class="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">!</span>
          </a>
        </nav>

        <!-- Bottom logout -->
        <div class="p-3 border-t border-violet-700 shrink-0">
          <button
            (click)="logout()"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-violet-300 hover:bg-violet-700 hover:text-white transition-colors"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <!-- Overlay for mobile -->
      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          (click)="sidebarOpen.set(false)"
        ></div>
      }

      <!-- Main content -->
      <div class="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-hidden">

        <!-- Top Navbar -->
        <header class="bg-white border-b border-gray-200 shadow-sm px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 z-20">
          <div class="flex items-center gap-3">
            <button
              (click)="sidebarOpen.set(true)"
              class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 class="text-lg font-semibold text-gray-800">Quality &amp; Compliance Officer</h1>
              <p class="text-xs text-gray-500 hidden sm:block">Hospital Pharmacy Quality Management</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- User badge -->
            <div class="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-lg px-3 py-1.5">
              <div class="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span class="text-sm font-medium text-violet-700">QCO</span>
            </div>

            <!-- Logout button -->
            <button
              (click)="logout()"
              class="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 transition-colors font-medium"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-auto p-4 lg:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class QcoLayoutComponent {
  sidebarOpen = signal(false);

  readonly activeClass =
    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-violet-500 text-white shadow-sm';
  readonly inactiveClass =
    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-violet-200 hover:bg-violet-700 hover:text-white transition-colors';

  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
