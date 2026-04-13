import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  template: `
    <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
      <h5 class="mb-0 fw-bold text-primary">PharmaStock</h5>
      <button class="btn btn-outline-danger btn-sm" (click)="logout()">Logout</button>
    </div>
    <div class="p-4">
      <p>Welcome to the Dashboard.</p>
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
