import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  InventoryDashboardStats,
  ExpiryWatch,
  TransferOrder,
  ReplenishmentRequest,
  ReplenishmentRule,
  InventoryBalance,
  InventoryLot,
  PharmLocation,
  ItemLookup,
} from '../models/inventory-controller.model';

@Injectable({ providedIn: 'root' })
export class InventoryControllerService {
  private readonly BASE = 'http://localhost:5259/api';

  constructor(private http: HttpClient) {}

  getLocations() {
    return this.http.get<PharmLocation[]>(`${this.BASE}/locations`);
  }

  getItemsLookup() {
    return this.http.get<ItemLookup[]>(`${this.BASE}/replenishment/items-lookup`);
  }

  getDashboardStats() {
    return this.http.get<InventoryDashboardStats>(`${this.BASE}/inventory-dashboard/stats`);
  }

  getInventoryLots() {
    return this.http.get<InventoryLot[]>(`${this.BASE}/inventorylot/search`);
  }

  getExpiryWatches() {
    return this.http.get<ExpiryWatch[]>(`${this.BASE}/expirywatch/active`);
  }

  getNearExpiryWatches(days = 500) {
    return this.http.get<ExpiryWatch[]>(`${this.BASE}/expirywatch/near-expiry?days=${days}`);
  }

  getTransferOrders() {
    return this.http.get<TransferOrder[]>(`${this.BASE}/transferorder/getAll`);
  }

  createTransferOrder(dto: { fromLocationId: number; toLocationId: number }) {
    return this.http.post<TransferOrder>(`${this.BASE}/transferorder/create`, dto);
  }

  getReplenishmentRequests() {
    return this.http.get<ReplenishmentRequest[]>(`${this.BASE}/replenishment/requests`);
  }

  createReplenishmentRequest(dto: {
    locationId: number;
    itemId: number;
    suggestedQty: number;
    ruleId: number;
  }) {
    return this.http.post<ReplenishmentRequest>(`${this.BASE}/replenishment/requests`, dto);
  }

  updateReplenishmentStatus(id: number, status: number) {
    return this.http.patch(`${this.BASE}/replenishment/requests/${id}/status?status=${status}`, {});
  }

  getReplenishmentRules() {
    return this.http.get<ReplenishmentRule[]>(`${this.BASE}/replenishment/rules`);
  }

  createReplenishmentRule(dto: { locationId: number; itemId: number; minLevel: number; parLevel: number; maxLevel: number; reviewCycle: boolean }) {
    return this.http.post<ReplenishmentRule>(`${this.BASE}/replenishment/rules`, dto);
  }

  updateReplenishmentRule(id: number, dto: { locationId: number; itemId: number; minLevel: number; parLevel: number; maxLevel: number; reviewCycle: boolean }) {
    return this.http.put<ReplenishmentRule>(`${this.BASE}/replenishment/rules/${id}`, dto);
  }

  deleteReplenishmentRule(id: number) {
    return this.http.delete(`${this.BASE}/replenishment/rules/${id}`);
  }

  getInventoryBalances() {
    return this.http.get<InventoryBalance[]>(`${this.BASE}/inventorybalance`);
  }

  getLowStockItems(threshold = 10) {
    return this.http.get<InventoryBalance[]>(`${this.BASE}/inventorybalance/low-stock?threshold=${threshold}`);
  }

  runReplenishmentCheck() {
    return this.http.post<{ message: string; newRequestsCreated: number }>(
      `${this.BASE}/replenishment/run-check`, {}
    );
  }

  convertToTransferOrder(reqId: number, fromLocationId = 1) {
    return this.http.post<any>(
      `${this.BASE}/replenishment/${reqId}/convert?fromLocationId=${fromLocationId}`, {}
    );
  }
}
