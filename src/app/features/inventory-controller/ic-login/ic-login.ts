import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-ic-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900">
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>

      <div class="relative w-full max-w-md px-4">
        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <!-- Header banner -->
          <div class="bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-6 text-center">
            <div class="flex items-center justify-center mb-3">
              <div class="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <h1 class="text-2xl font-bold text-white">PharmaStock</h1>
            <p class="text-teal-100 text-sm mt-1">Inventory Controller Portal</p>
          </div>

          <!-- Form -->
          <div class="px-8 py-8">
            <p class="text-gray-500 text-sm text-center mb-6">Sign in with your Inventory Controller credentials</p>

            @if (error()) {
              <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ error() }}
              </div>
            }

            <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="username"
                    [(ngModel)]="credentials.username"
                    required
                    autocomplete="username"
                    class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    [(ngModel)]="credentials.password"
                    required
                    autocomplete="current-password"
                    class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                [disabled]="loading() || loginForm.invalid"
                class="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-2.5 px-4 rounded-lg hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all text-sm shadow-md"
              >
                @if (loading()) {
                  <span class="flex items-center justify-center gap-2">
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Signing in...
                  </span>
                } @else {
                  Sign In
                }
              </button>
            </form>

            <p class="text-center text-xs text-gray-400 mt-6">
              Inventory Controller Access Only &bull; PharmaStock v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class IcLoginComponent {
  credentials = { username: '', password: '' };
  loading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    if (authService.isLoggedIn() && authService.isInventoryController()) {
      router.navigate(['/ic/dashboard']);
    }
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.authService.login(this.credentials).subscribe({
      next: () => {
        // Check role via the signal (which already decoded the JWT)
        if (this.authService.isInventoryController()) {
          this.router.navigate(['/ic/dashboard']);
        } else {
          const actualRole = this.authService.getRole();
          console.warn('Login role received:', actualRole);
          this.authService.logout();
          this.error.set(
            `Access denied. Role "${actualRole}" is not authorized here. ` +
            `Expected: InventoryController`
          );
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Invalid username or password');
        this.loading.set(false);
      },
    });
  }
}
