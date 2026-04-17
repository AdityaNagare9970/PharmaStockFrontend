import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent],
  template: `
    <div class="flex h-screen bg-gray-100">
      <app-sidebar />

      <div class="flex-1 ml-64 flex flex-col overflow-hidden">
        <!-- Topbar -->oo
        <header class="bg-white shadow-sm px-6 py-4 flex items-center justify-between shrink-0">
          <h1 class="text-xl font-semibold text-gray-800">Dashboard</h1>
          <button
            (click)="logout()"
            class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors font-medium"
          >
            Logout
          </button>
        </header>

        <!-- Content -->
        <main class="flex-1 p-6 overflow-auto">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p class="text-sm font-medium text-gray-500 uppercase tracking-wide">Welcome</p>
              <p class="text-gray-800 mt-2 font-medium">Manage your pharmacy inventory</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
