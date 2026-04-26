import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';
import { finalize } from 'rxjs';

const ROLE_ROUTES: Record<string, string> = {
  'admin': '/admin',
  'procurementofficer': '/procurement',
  'inventorycontroller': '/ic',
  'qualitycomplianceofficer': '/quality',
  'pharmacist': '/pharmacist'
};

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  credentials: LoginRequest = { username: '', password: '' };
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(private authService: AuthService, private router: Router) {
    // Already logged in → redirect to role-specific dashboard
    if (authService.isLoggedIn()) {
      const role = authService.getRole().toLowerCase().replace(/\s+/g, '');
      const route = ROLE_ROUTES[role] ?? '/dashboard';
      router.navigate([route]);
    }
  }

  onSubmit() {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage.set('Please enter username and password.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.credentials)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.authService.saveToken(res.token);
          this.authService.saveRole(res.role);
          const role = res.role.toLowerCase().replace(/\s+/g, '');
          const route = ROLE_ROUTES[role] ?? '/dashboard';
          this.router.navigate([route]);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message ?? 'Login failed. Please try again.');
        }
      });
  }
}
