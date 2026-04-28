import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PurchaseItem, CreatePurchaseItemRequest, UpdatePurchaseItemRequest } from '../models/purchase-item.model';

@Injectable({ providedIn: 'root' })
export class PurchaseItemService {
  private base = 'http://localhost:5259/api/PurchaseItem';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<PurchaseItem[]>(this.base);
  }

  create(item: CreatePurchaseItemRequest) {
    return this.http.post<PurchaseItem>(`${this.base}/create`, {
      PurchaseOrderId: item.purchaseOrderId,
      ItemId: item.itemId,
      OrderedQty: item.orderedQty,
      UnitPrice: item.unitPrice,
      TaxPct: item.taxPct,
    });
  }

  update(id: number, item: UpdatePurchaseItemRequest) {
    return this.http.put<PurchaseItem>(`${this.base}/${id}`, {
      OrderedQty: item.orderedQty,
      UnitPrice: item.unitPrice,
      TaxPct: item.taxPct,
    });
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
