import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  PurchaseOrderStatus,
} from '../models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private base = 'http://localhost:5259/api/PurchaseOrder';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<PurchaseOrder[]>(this.base);
  }

  getStatuses() {
    return this.http.get<PurchaseOrderStatus[]>(`${this.base}/statuses`);
  }

  create(po: CreatePurchaseOrderRequest) {
    return this.http.post<PurchaseOrder>(`${this.base}/create`, {
      VendorId:     po.vendorId,
      LocationId:   po.locationId,
      OrderDate:    po.orderDate,
      ExpectedDate: po.expectedDate,
    });
  }

  update(id: number, po: UpdatePurchaseOrderRequest) {
    const body: any = {};
    if (po.expectedDate)            body['ExpectedDate']          = po.expectedDate;
    if (po.purchaseOrderStatusId)   body['PurchaseOrderStatusId'] = po.purchaseOrderStatusId;
    return this.http.put<PurchaseOrder>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
