export interface QCODashboardStats {
  activeQuarantines: number;
  openRecalls: number;
  nearExpiryCount: number;
  recentAdjustmentsCount: number;
  recentQuarantines: RecentQuarantineDTO[];
  recentRecalls: RecentRecallDTO[];
}

export interface RecentQuarantineDTO {
  quarantaineActionId: number;
  inventoryLotId: number;
  batchNumber: string | null;
  itemName: string;
  reason: string;
  quarantineDate: string;
  status: string;
}

export interface RecentRecallDTO {
  recallNoticeId: number;
  drugName: string;
  noticeDate: string;
  reason: string;
  action: string;
  status: boolean;
}

export interface QuarantineActionDTO {
  quarantaineActionId: number;
  inventoryLotId: number;
  batchNumber: number;
  itemName: string;
  quarantineDate: string;
  reason: string;
  releasedDate: string | null;
  status: number;
  statusName: string;
}

export interface CreateQuarantineActionDTO {
  inventoryLotId: number;
  reason: string;
}

export interface RecallNoticeDTO {
  recallNoticeId: number;
  drugId: number;
  drugName: string;
  noticeDate: string;
  reason: string | null;
  action: number;
  actionName: string;
  status: boolean;
}

export interface StockAdjustmentDTO {
  stockAdjustmentId: number;
  locationId: number;
  locationName: string;
  itemId: number;
  itemName: string;
  inventoryLotId: number;
  batchNumber: number;
  quantityDelta: number;
  reasonCode: number;
  reasonDescription: string;
  approvedBy: number;
  approvedByName: string;
  postedDate: string;
}
