export interface PurchaseItem {
  purchaseItemId: number;
  purchaseOrderId: number;
  itemId: number;
  orderedQty: number;
  unitPrice: number;
  taxPct: number;
  taxAmount: number;
  totalAmount: number;
}

export interface CreatePurchaseItemRequest {
  purchaseOrderId: number;
  itemId: number;
  orderedQty: number;
  unitPrice: number;
  taxPct: number;
}

export interface UpdatePurchaseItemRequest {
  orderedQty: number;
  unitPrice: number;
  taxPct: number;
}
