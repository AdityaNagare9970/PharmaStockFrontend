import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, UserRole, UpsertUser } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:5259/api/admin';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getById(id: number) {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  getRoles() {
    return this.http.get<UserRole[]>(`${this.apiUrl}/roles`);
  }

  getRoleById(id: number) {
    return this.http.get<UserRole>(`${this.apiUrl}/roles/${id}`);
  }

  create(data: UpsertUser) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/UpsertUser`,
      { ...data, isCreate: true }
    );
  }

  update(data: UpsertUser) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/UpsertUser`,
      { ...data, isCreate: false }
    );
  }
}
