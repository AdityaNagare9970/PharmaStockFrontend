export interface PendingGrnPO {
  purchaseOrderId: number;
  vendorName: string;
  locationId: number;
  locationName: string;
  orderDate: string;
  expectedDate: string;
  status: string;
  itemCount: number;
}

export interface PODetails {
  purchaseOrderId: number;
  vendorId: number;
  vendorName: string;
  locationId: number;
  locationName: string;
  orderDate: string;
  expectedDate: string;
  status: string;
  items: PODetailItem[];
}

export interface PODetailItem {
  purchaseItemId: number;
  itemId: number;
  itemName: string;
  orderedQty: number;
  acceptedQty: number;
  outstandingQty: number;
  unitPrice: number;
  taxPct: number;
}

export interface GRN {
  goodsReceiptId: number;
  purchaseOrderId: number;
  vendorName: string;
  receivedDate: string;
  statusId: number;
  status: string;
  receivedBy: string;
  itemCount: number;
}

export interface GRNListResponse {
  items: GRN[];
}

export interface GRNDetail {
  goodsReceiptId?: number;
  purchaseOrderId?: number;
  vendorName?: string;
  locationName: string;
  receivedBy?: string;
  receivedDate?: string;
  status?: string;
  items: GRNDetailItem[];
}

export interface GRNDetailItem {
  goodsReceiptItemId: number;
  itemId: number;
  itemName: string;
  batchNumber: number | string;
  expiryDate: string;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  rejectionReason: string | null;
}

export interface CreateGRNRequest {
  purchaseOrderId: number;
  receivedBy: string;
  receivedDate: string;
}

export interface CreateGRNItemRequest {
  goodsReceiptId: number;
  purchaseItemId: number;
  itemId: number;
  batchNumber: string;
  expiryDate: string;
  receivedQty: number;
}

export interface CompleteQcRequest {
  items: QcItem[];
}

export interface QcItem {
  grnItemId: number;
  acceptedQty: number;
  rejectedQty: number;
  rejectionReason: string;
}

// Form model used in UI for each item during GRN creation
export interface GrnFormItem {
  purchaseItemId: number;
  itemId: number;
  itemName: string;
  orderedQty: number;
  acceptedQty: number;
  outstandingQty: number;
  batchNumber: string;
  expiryDate: string;
  receivedQty: number;
}

// Form model used in UI for each item during QC
export interface QcFormItem {
  goodsReceiptItemId: number;
  itemId: number;
  itemName: string;
  batchNumber: number | string;
  expiryDate: string;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  rejectionReason: string;
}
