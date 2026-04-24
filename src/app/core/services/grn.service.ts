import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {
  PendingGrnPO,
  PODetails,
  GRN,
  GRNListResponse,
  GRNDetail,
  CreateGRNRequest,
  CreateGRNItemRequest,
  CompleteQcRequest,
} from '../models/grn.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GrnService {
  private readonly BASE = 'http://localhost:5259/api';

  constructor(private http: HttpClient) { }

  getApprovedPendingGrn() {
    return this.http.get<PendingGrnPO[]>(`${this.BASE}/PurchaseOrder/approved-pending-grn`);
  }

  getPODetails(id: number) {
    return this.http.get<PODetails>(`${this.BASE}/PurchaseOrder/${id}/details`);
  }

  getAllGrns() {
    return this.http.get<GRNListResponse>(`${this.BASE}/GoodsReceipts`).pipe(
      map(res => res?.items ?? (res as any) ?? [])
    );
  }

  getGrnById(id: number) {
    return this.http.get<GRNDetail>(`${this.BASE}/GoodsReceipts/${id}`);
  }

  getPendingQc() {
    return this.http.get<GRN[]>(`${this.BASE}/GoodsReceipts/pending-qc`);
  }

  createGrn(dto: CreateGRNRequest) {
    return this.http.post<{ goodsReceiptId: number; message?: string }>(`${this.BASE}/GoodsReceipts`, {
      PurchaseOrderId: dto.purchaseOrderId,
      ReceivedBy: dto.receivedBy,
      ReceivedDate: dto.receivedDate,
    });
  }

  createGrnItem(dto: CreateGRNItemRequest) {
    return this.http.post<any>(`${this.BASE}/v1/goods-receipt/CreateGRNItem`, {
      GoodsReceiptId: dto.goodsReceiptId,
      PurchaseOrderItemId: dto.purchaseItemId,
      ItemId: dto.itemId,
      BatchNumber: dto.batchNumber,
      ExpiryDate: dto.expiryDate,
      ReceivedQty: dto.receivedQty,
      AcceptedQty: dto.receivedQty,
      RejectedQty: 0,
    });
  }

  completeQc(grnId: number, req: CompleteQcRequest) {
    // DEBUG PRINT
    console.log('FE sending QC completion for GRN:', grnId);
    console.log('Payload mapping items:', req.items);

    return this.http.patch<any>(`${this.BASE}/GoodsReceipts/${grnId}/complete-qc`, {
      Items: req.items.map(i => ({
        GrnItemId: i.grnItemId,
        AcceptedQty: i.acceptedQty,
        RejectedQty: i.rejectedQty,
        RejectionReason: i.rejectionReason,
      })),
    }).pipe(
      tap(response => console.log('BE Response after QC:', response))
    );
  }
}
