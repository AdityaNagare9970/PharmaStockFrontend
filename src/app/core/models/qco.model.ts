export interface QCODashboardStats {
  activeQuarantines: number;
  nearExpiryCount: number;
  recentAdjustmentsCount: number;
  auditEventsToday: number;
  recentQuarantines: RecentQuarantineDTO[];
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
