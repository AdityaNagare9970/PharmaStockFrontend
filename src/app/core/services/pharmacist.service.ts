import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  PharmacistDashboardStats,
  DispenseRefDTO,
  CreateDispenseRefDTO,
  IncomingTransferDTO,
  DestinationType,
} from '../models/pharmacist.model';
import { InventoryBalance } from '../models/inventory-controller.model';
import { ExpiryWatch } from '../models/inventory-controller.model';

@Injectable({ providedIn: 'root' })
export class PharmacistService {
  private readonly BASE = 'http://localhost:5259/api';

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboardStats() {
    return this.http.get<PharmacistDashboardStats>(`${this.BASE}/pharmacist-dashboard/stats`);
  }

  // Inventory at location
  getInventoryByLocation() {
    return this.http.get<InventoryBalance[]>(`${this.BASE}/pharmacist-inventory`);
  }

  // Incoming transfers
  getIncomingTransfers() {
    return this.http.get<IncomingTransferDTO[]>(`${this.BASE}/pharmacist-transfer/incoming`);
  }

  confirmTransfer(transferOrderId: number) {
    return this.http.patch(`${this.BASE}/pharmacist-transfer/${transferOrderId}/confirm`, {});
  }

  receiveTransfer(transferOrderId: number) {
    return this.http.patch(`${this.BASE}/pharmacist-transfer/${transferOrderId}/receive`, {});
  }

  // Dispense
  getDispenseRecords() {
    return this.http.get<DispenseRefDTO[]>(`${this.BASE}/dispense`);
  }

  createDispense(dto: CreateDispenseRefDTO) {
    return this.http.post<DispenseRefDTO>(`${this.BASE}/dispense`, dto);
  }

  getDestinationTypes() {
    return this.http.get<DestinationType[]>(`${this.BASE}/dispense/destination-types`);
  }

  // Near expiry at location
  getExpiryWatch(days = 9999) {
    return this.http.get<ExpiryWatch[]>(`${this.BASE}/expirywatch/near-expiry?days=${days}`);
  }
}
