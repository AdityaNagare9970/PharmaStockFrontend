import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center p-3 border-bottom shadow-sm bg-white">
      <h5 class="mb-0 fw-bold text-primary">PharmaStock</h5>
      <button class="btn btn-outline-danger btn-sm" (click)="logout()">Logout</button>
    </div>
    <div class="container py-4">
      <h6 class="text-muted mb-3">Quick Access</h6>
      <div class="d-flex flex-wrap gap-3">
        <a routerLink="/locations" class="btn btn-outline-primary d-flex align-items-center gap-2">
          📦 <span>Location Management</span>
        </a>
      </div>
    </div>
  `
})
export class Dashboard {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
