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

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role ?? null;
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem('token');
  }
}
