import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { AuditDto, AuditLog, AuditLogResponse } from '../models/audit.model';

@Injectable({ providedIn: 'root' })
export class AuditService {

  private readonly baseUrl = 'http://localhost:5259/api/Audit';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(`${this.baseUrl}/GetAllAuditLogs`).pipe(
      map(items => (items ?? []).map(raw => this.normalize(raw)))
    );
  }

  create(dto: AuditDto) {
    return this.http.post<AuditLogResponse>(`${this.baseUrl}/CreateAudit`, dto);
  }

  private normalize(raw: any): AuditLog {
    return {
      auditId:   raw.auditId   ?? raw.AuditId   ?? 0,
      userId:    raw.userId    ?? raw.UserId     ?? 0,
      action:    raw.action    ?? raw.Action     ?? '',
      resource:  raw.resource  ?? raw.Resource   ?? '',
      timestamp: raw.timestamp ?? raw.Timestamp  ?? '',
      metadata:  raw.metadata  ?? raw.Metadata   ?? undefined,
    };
  }
}
