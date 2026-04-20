export interface PurchaseOrder {
  purchaseOrderId: number;
  vendorId: number;
  vendorName: string;
  locationId: number;
  orderDate: string;
  expectedDate: string;
  purchaseOrderStatusId: number;
  status: string;
}

export interface CreatePurchaseOrderRequest {
  vendorId: number;
  locationId: number;
  orderDate: string;
  expectedDate: string;
}

export interface UpdatePurchaseOrderRequest {
  expectedDate?: string;
  purchaseOrderStatusId?: number;
}

export interface PurchaseOrderStatus {
  purchaseOrderStatusId: number;
  status: string;
}
