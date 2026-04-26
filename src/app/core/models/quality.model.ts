export interface QualityDashboardStats {
  activeExcursions: number;
  openRecalls: number;
  quarantinedLots: number;
  auditEventsToday: number;
}

export interface ColdChainLog {
  logId: number;
  locationId: number;
  locationName: string;
  sensorId: string;
  timestamp: string;
  temperatureC: number;
  status: string; // 'Normal' | 'Excursion'
}

export interface RecallNotice {
  recallNoticeId: number;
  drugId: number;
  drugName: string;
  noticeDate: string;
  reason: string;
  action: number;
  actionName: string;
  status: boolean; // false = Open, true = Closed
}

export interface ActiveLot {
  inventoryLotId: number;
  batchNumber: string;
  expiryDate: string;
  itemName: string;
}

export interface QuarantineAction {
  quarantaineActionId: number;
  inventoryLotId: number;
  batchNumber: string;
  itemName: string;
  quarantineDate: string;
  reason: string;
  releasedDate?: string;
  status: number;
  statusName: string;
}
