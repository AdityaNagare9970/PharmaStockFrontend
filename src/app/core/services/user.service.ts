import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { User, UserRole, UpsertUser } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:5259/api/admin';

  constructor(private http: HttpClient) {}

  // Normalizes both PascalCase (backend default) and camelCase responses
  private normalizeUser(raw: any): User {
    return {
      userId:    raw.userId    ?? raw.UserId    ?? 0,
      username:  raw.username  ?? raw.Username  ?? '',
      email:     raw.email     ?? raw.Email     ?? '',
      phone:     raw.phone     ?? raw.Phone     ?? '',
      roleId:    raw.roleId    ?? raw.RoleId    ?? 0,
      roleType:  raw.roleType  ?? raw.RoleType  ?? '',
      statusId:  raw.statusId  ?? raw.StatusId  ?? false,
      createdOn: raw.createdOn ?? raw.CreatedOn ?? undefined,
      createdBy: raw.createdBy ?? raw.CreatedBy ?? undefined,
      updatedOn: raw.updatedOn ?? raw.UpdatedOn ?? undefined,
      updatedBy: raw.updatedBy ?? raw.UpdatedBy ?? undefined,
    };
  }

  private normalizeRole(raw: any): UserRole {
    return {
      roleId:   raw.roleId   ?? raw.RoleId   ?? 0,
      roleType: raw.roleType ?? raw.RoleType ?? '',
    };
  }

  getAll() {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map(items => (items ?? []).map(raw => this.normalizeUser(raw)))
    );
  }

  getById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`).pipe(
      map(raw => this.normalizeUser(raw))
    );
  }

  getRoles() {
    return this.http.get<any[]>(`${this.apiUrl}/roles`).pipe(
      map(items => (items ?? []).map(raw => this.normalizeRole(raw)))
    );
  }

  getRoleById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/roles/${id}`).pipe(
      map(raw => this.normalizeRole(raw))
    );
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
