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
  recallId: number;
  drugId: number;
  drugName: string;
  noticeDate: string;
  reason: string;
  action: string; // 'Quarantine' | 'Return' | 'Dispose'
  status: string; // 'Open' | 'Closed'
}

export interface QuarantineAction {
  qaId: number;
  lotId: number;
  batchNumber: string;
  itemName: string;
  quarantineDate: string;
  reason: string;
  releasedDate?: string;
  status: string; // 'Quarantined' | 'Released' | 'Disposed'
}
