import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

// Maps normalised role strings → dashboard routes
const ROLE_ROUTES: Record<string, string> = {
  inventorycontroller:        '/ic/dashboard',
  qualitycomplianceofficer:   '/qco/dashboard',
  pharmacist:                 '/pharmacist/dashboard',
  admin:                      '/admin/dashboard',
  procurementofficer:         '/procurement/dashboard',
};

@Component({
  selector: 'app-unified-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">

      <!-- Background decorative blobs -->
      <div class="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10 blur-3xl"
           style="background: radial-gradient(circle, #14b8a6, transparent)"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-10 blur-3xl"
           style="background: radial-gradient(circle, #8b5cf6, transparent)"></div>

      <div class="relative w-full max-w-md px-4 z-10">

        <!-- Logo / header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 border border-white/20">
            <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">PharmaStock</h1>
          <p class="text-slate-400 text-sm mt-1">Hospital Pharmacy Management System</p>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">

          <!-- Card header strip -->
          <div class="px-8 py-5" style="background: linear-gradient(to right, #0f172a, #1e293b)">
            <h2 class="text-white font-semibold text-lg">Sign In</h2>
            <p class="text-slate-400 text-xs mt-0.5">Enter your credentials to continue</p>
          </div>

          <!-- Form body -->
          <div class="px-8 py-7">

            @if (error()) {
              <div class="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ error() }}</span>
              </div>
            }

            <form (ngSubmit)="onSubmit()" #loginForm="ngForm" novalidate>

              <!-- Username -->
              <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="username"
                    [(ngModel)]="username"
                    required
                    autocomplete="username"
                    placeholder="Enter your username"
                    class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                  />
                </div>
              </div>

              <!-- Password -->
              <div class="mb-7">
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    [(ngModel)]="password"
                    required
                    autocomplete="current-password"
                    placeholder="Enter your password"
                    class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                  />
                </div>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                [disabled]="loading()"
                class="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                style="background: linear-gradient(to right, #0f172a, #1e293b)"
              >
                @if (loading()) {
                  <span class="flex items-center justify-center gap-2">
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                    Signing in...
                  </span>
                } @else {
                  Sign In
                }
              </button>

            </form>

            <p class="text-center text-xs text-gray-400 mt-6">PharmaStock v1.0 &bull; Authorized Personnel Only</p>

          </div>
        </div>

      </div>
    </div>
  `,
})
export class UnifiedLoginComponent {
  username = '';
  password = '';
  loading  = signal(false);
  error    = signal('');

  constructor(private authService: AuthService, private router: Router) {
    // If already logged in, skip straight to the correct dashboard
    if (authService.isLoggedIn()) {
      this.redirectByRole(authService.getRole());
    }
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.error.set('Please enter your username and password.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        // Save token and role from the response
        this.authService.saveToken(res.token);
        this.authService.saveRole(res.role);
        localStorage.setItem('userId', res.userId.toString());

        // Redirect based on the role that came back from the JWT
        const role = res.role.toLowerCase().replace(/[\s_]/g, '');
        const route = ROLE_ROUTES[role];

        if (route) {
          this.router.navigate([route]);
        } else {
          // Unknown role — still logged in, send to generic dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Invalid username or password. Please try again.');
        this.loading.set(false);
      },
    });
  }

  private redirectByRole(role: string) {
    const clean = role.toLowerCase().replace(/[\s_]/g, '');
    const route = ROLE_ROUTES[clean] ?? '/dashboard';
    this.router.navigate([route]);
  }
}
