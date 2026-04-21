import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  QCODashboardStats,
  QuarantineActionDTO,
  CreateQuarantineActionDTO,
  RecallNoticeDTO,
  CreateRecallNoticeDTO,
  StockAdjustmentDTO,
} from '../models/qco.model';
import { ExpiryWatch, InventoryLot } from '../models/inventory-controller.model';

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

  // Recall Notices
  getRecallNotices() {
    return this.http.get<RecallNoticeDTO[]>(`${this.BASE}/recall`);
  }

  createRecallNotice(dto: CreateRecallNoticeDTO) {
    return this.http.post<RecallNoticeDTO>(`${this.BASE}/recall`, dto);
  }

  resolveRecall(id: number) {
    return this.http.patch(`${this.BASE}/recall/${id}/resolve`, {});
  }

  // Stock Adjustments
  getStockAdjustments() {
    return this.http.get<StockAdjustmentDTO[]>(`${this.BASE}/stock-adjustment`);
  }

  // Expiry watch (reuse existing endpoint)
  getExpiryWatch(days = 9999) {
    return this.http.get<ExpiryWatch[]>(`${this.BASE}/expirywatch/near-expiry?days=${days}`);
  }

  // Inventory lots (reuse existing endpoint)
  getInventoryLots() {
    return this.http.get<InventoryLot[]>(`${this.BASE}/inventorylot/search`);
  }
}
