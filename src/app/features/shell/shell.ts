import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  constructor(private authService: AuthService, private router: Router) {}

  get isAdmin(): boolean {
    return this.authService.hasRole('admin');
  }

  get canSeeVendors(): boolean {
    return this.authService.hasRole('admin', 'procurementofficer');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
