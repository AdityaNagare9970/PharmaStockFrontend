import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QualityDashboardStats, ColdChainLog, RecallNotice, QuarantineAction } from '../models/quality.model';

@Injectable({ providedIn: 'root' })
export class QualityService {
  private readonly BASE = 'http://localhost:5259/api';

  constructor(private http: HttpClient) {}

    getDashboardStats() {
    return this.http.get<QualityDashboardStats>(`${this.BASE}/qco-dashboard/stats`);
  }

  getColdChainLogs() {
    return this.http.get<ColdChainLog[]>(`${this.BASE}/coldchain/logs`);
  }

  getRecalls() {
    return this.http.get<RecallNotice[]>(`${this.BASE}/recall`);
  }

  closeRecall(recallId: number) {
    return this.http.patch(`${this.BASE}/recall/${recallId}/close`, {});
  }

  getQuarantineActions() {
    return this.http.get<QuarantineAction[]>(`${this.BASE}/quarantine`);
  }

  releaseQuarantine(qaId: number) {
    return this.http.patch(`${this.BASE}/quarantine/${qaId}/release`, {});
  }

  disposeQuarantine(qaId: number) {
    return this.http.patch(`${this.BASE}/quarantine/${qaId}/dispose`, {});
  }
}
