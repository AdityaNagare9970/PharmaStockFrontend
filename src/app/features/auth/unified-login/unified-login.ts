import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

type RoleOption = {
  value: string;
  label: string;
  route: string;
  gradient: string;
  btnGradient: string;
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

          <!-- Colored role-selector header (inline style = always works) -->
          <div class="px-8 py-5" [style.background]="selectedRole().gradient">
            <label class="block text-white text-xs font-semibold uppercase tracking-widest mb-2 opacity-80">
              Sign in as
            </label>
            <div class="relative">
              <select
                [value]="selectedRole().value"
                (change)="onRoleChange($event)"
                class="w-full appearance-none bg-white/20 text-white font-semibold text-sm rounded-xl px-4 py-2.5 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
              >
                @for (role of roles; track role.value) {
                  <option [value]="role.value" class="text-gray-800 bg-white font-medium">
                    {{ role.label }}
                  </option>
                }
              </select>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg class="w-4 h-4 text-white opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Form body — white section -->
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

              <!-- Username field -->
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
                    class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-colors"
                  />
                </div>
              </div>

              <!-- Password field -->
              <div class="mb-6">
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
                    class="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-colors"
                  />
                </div>
              </div>

              <!-- Submit button -->
              <button
                type="submit"
                [disabled]="loading()"
                class="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                [style.background]="selectedRole().btnGradient"
              >
                @if (loading()) {
                  <span class="flex items-center justify-center gap-2">
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                    Signing in...
                  </span>
                } @else {
                  Sign In as {{ selectedRole().label }}
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
  loading = signal(false);
  error = signal('');

  readonly roles: RoleOption[] = [
    {
      value: 'inventorycontroller',
      label: 'Inventory Controller',
      route: '/ic/dashboard',
      gradient: 'linear-gradient(to right, #0f766e, #059669)',
      btnGradient: 'linear-gradient(to right, #0f766e, #059669)',
    },
    {
      value: 'qualitycomplianceofficer',
      label: 'Quality & Compliance Officer',
      route: '/qco/dashboard',
      gradient: 'linear-gradient(to right, #7c3aed, #9333ea)',
      btnGradient: 'linear-gradient(to right, #7c3aed, #9333ea)',
    },
    {
      value: 'pharmacist',
      label: 'Pharmacist',
      route: '/pharmacist/dashboard',
      gradient: 'linear-gradient(to right, #2563eb, #0891b2)',
      btnGradient: 'linear-gradient(to right, #2563eb, #0891b2)',
    },
    {
      value: 'admin',
      label: 'Admin',
      route: '/dashboard',
      gradient: 'linear-gradient(to right, #374151, #4b5563)',
      btnGradient: 'linear-gradient(to right, #374151, #4b5563)',
    },
    {
      value: 'procurementofficer',
      label: 'Procurement Officer',
      route: '/procurement/dashboard',
      gradient: 'linear-gradient(to right, #d97706, #ea580c)',
      btnGradient: 'linear-gradient(to right, #d97706, #ea580c)',
    },
  ];

  selectedRole = signal<RoleOption>(this.roles[0]);

  constructor(private authService: AuthService, private router: Router) {
    const role = authService.getRole();
    if (role && authService.isLoggedIn()) {
      this.redirectByRole(role);
    }
  }

  onRoleChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    const found = this.roles.find(r => r.value === val);
    if (found) {
      this.selectedRole.set(found);
      this.error.set('');
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
      next: () => {
        const rawRole = this.authService.getRole() ?? '';
        const role = rawRole.toLowerCase().replace(/[\s_]/g, '');
        const expected = this.selectedRole().value;
        if (role === expected) {
          this.router.navigate([this.selectedRole().route]);
        } else {
          // Logged in as wrong role — clear token and show error
          this.authService.logout();
          this.error.set(
            `This account has the role "${rawRole}". Please select the matching role from the dropdown.`
          );
          this.loading.set(false);
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
    const found = this.roles.find(r => r.value === clean);
    if (found) this.router.navigate([found.route]);
  }
}
