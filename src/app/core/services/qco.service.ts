import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  QCODashboardStats,
  QuarantineActionDTO,
  CreateQuarantineActionDTO,
  StockAdjustmentDTO,
} from '../models/qco.model';

@Injectable({ providedIn: 'root' })
export class QcoService {
  private readonly BASE = 'http://localhost:5259/api';

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboardStats() {
    return this.http.get<QCODashboardStats>(`${this.BASE}/qco-dashboard/stats`);
  }

  // Quarantine
  getQuarantineActions() {
    return this.http.get<QuarantineActionDTO[]>(`${this.BASE}/quarantine`);
  }

  createQuarantineAction(dto: CreateQuarantineActionDTO) {
    return this.http.post<QuarantineActionDTO>(`${this.BASE}/quarantine`, dto);
  }

  releaseQuarantine(id: number) {
    return this.http.patch(`${this.BASE}/quarantine/${id}/release`, {});
  }

  disposeQuarantine(id: number) {
    return this.http.patch(`${this.BASE}/quarantine/${id}/dispose`, {});
  }

// Stock Adjustments
  getStockAdjustments() {
    return this.http.get<StockAdjustmentDTO[]>(`${this.BASE}/stock-adjustment`);
  }

}
