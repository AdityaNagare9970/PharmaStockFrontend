import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-pharmacist-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">

      <!-- Sidebar -->
      <aside
        [class]="sidebarOpen()
          ? 'fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-900 to-cyan-800 flex flex-col transition-transform duration-300 translate-x-0'
          : 'fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-900 to-cyan-800 flex flex-col transition-transform duration-300 -translate-x-full lg:translate-x-0'"
      >
        <!-- Brand -->
        <div class="flex items-center justify-between h-16 px-5 border-b border-blue-700 shrink-0">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p class="text-white pt-2 text-sm font-bold leading-none">PharmaStock</p>
              <p class="text-cyan-300 text-xs leading-none">Pharmacist</p>
            </div>
          </div>
          <button (click)="sidebarOpen.set(false)" class="lg:hidden text-cyan-300 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Role badge -->
        <div class="mx-4 mt-4 mb-2 px-3 py-2 bg-blue-800 bg-opacity-60 rounded-lg border border-blue-700">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-white text-xs font-medium truncate">Pharmacist</p>
              <p class="text-cyan-300 text-xs truncate">Location #1</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p class="px-3 py-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider">Main</p>

          <a
            routerLink="/pharmacist/dashboard"
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

          <p class="px-3 py-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mt-2">Inventory</p>

          <a
            routerLink="/pharmacist/stock"
            routerLinkActive #stockLink="routerLinkActive"
            [class]="stockLink.isActive ? activeClass : inactiveClass"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            My Stock
          </a>

          <a
            routerLink="/pharmacist/expiry"
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

          <p class="px-3 py-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mt-2">Operations</p>

          <a
            routerLink="/pharmacist/transfers"
            routerLinkActive #transferLink="routerLinkActive"
            [class]="transferLink.isActive ? activeClass : inactiveClass"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Incoming Transfers
          </a>

          <a
            routerLink="/pharmacist/dispense"
            routerLinkActive #dispenseLink="routerLinkActive"
            [class]="dispenseLink.isActive ? activeClass : inactiveClass"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Dispense
          </a>
        </nav>

        <!-- Bottom logout -->
        <div class="p-3 border-t border-blue-700 shrink-0">
          <button
            (click)="logout()"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-cyan-300 hover:bg-blue-700 hover:text-white transition-colors"
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
              <h1 class="text-lg font-semibold text-gray-800">Pharmacist Portal</h1>
              <p class="text-xs text-gray-500 hidden sm:block">Hospital Pharmacy Dispensing & Stock Management</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- User badge -->
            <div class="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
              <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span class="text-sm font-medium text-blue-700">Pharmacist</span>
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
export class PharmacistLayoutComponent {
  sidebarOpen = signal(false);

  readonly activeClass =
    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-cyan-500 text-white shadow-sm';
  readonly inactiveClass =
    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-cyan-200 hover:bg-blue-700 hover:text-white transition-colors';

  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
