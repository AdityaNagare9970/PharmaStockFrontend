import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5259/api/login';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest) {
    return this.http.post<any>(this.apiUrl, credentials).pipe(
      map((res): LoginResponse => ({
        token:  res.token  ?? res.Token  ?? '',
        userId: res.userId ?? res.UserId ?? 0,
        role:   res.role   ?? res.Role   ?? '',
      }))
    );
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  saveRole(role: string) {
    localStorage.setItem('role', role.toLowerCase());
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** Returns normalised role string (lowercase, no spaces/underscores). */
  getRole(): string {
    // 1. Check localStorage first
    const stored = localStorage.getItem('role');
    if (stored) return stored.toLowerCase().replace(/[\s_]/g, '');

    // 2. Fall back: decode role from JWT payload
    const token = this.getToken();
    if (!token) return '';

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role =
        payload['role'] ??
        payload['roles'] ??
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        '';
      const resolved = Array.isArray(role) ? role[0] : role;
      if (resolved) this.saveRole(resolved);
      return (resolved as string).toLowerCase().replace(/[\s_]/g, '');
    } catch {
      return '';
    }
  }

  hasRole(...roles: string[]): boolean {
    const current = this.getRole();
    return roles.map(r => r.toLowerCase().replace(/[\s_]/g, '')).includes(current);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isInventoryController(): boolean {
    return this.hasRole('inventorycontroller', 'inventory_controller');
  }

  isQCO(): boolean {
    return this.hasRole('qualitycomplianceofficer', 'quality_compliance_officer');
  }

  isPharmacist(): boolean {
    return this.hasRole('pharmacist');
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  }
}
