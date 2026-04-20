import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:5259/api';

  isLoggedIn = signal<boolean>(this.hasToken());
  userRole = signal<string>(localStorage.getItem('role') ?? '');

  // Accepts any casing / spacing variant: "InventoryController", "Inventory Controller", etc.
  isInventoryController = computed(() => {
    const role = this.userRole().toLowerCase().replace(/\s+/g, '');
    return role === 'inventorycontroller' || role === 'inventory_controller';
  });

  constructor(private http: HttpClient, private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  /** Decode a JWT and return its payload as an object */
  private decodeJwt(token: string): Record<string, unknown> {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return {};
    }
  }

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => {
        // Prefer role from the JWT payload (more reliable than response body field name)
        const payload = this.decodeJwt(response.token);
        const roleFromJwt =
          (payload['role'] as string) ||
          (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string) ||
          response.role ||
          '';

        localStorage.setItem('token', response.token);
        localStorage.setItem('role', roleFromJwt);
        localStorage.setItem('userId', response.userId?.toString() ?? '');
        this.isLoggedIn.set(true);
        this.userRole.set(roleFromJwt);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    this.isLoggedIn.set(false);
    this.userRole.set('');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string {
    return localStorage.getItem('role') ?? '';
  }

  getUserId(): number {
    return parseInt(localStorage.getItem('userId') ?? '0', 10);
  }
}
