export interface PharmacistDashboardStats {
  totalStockItems: number;
  pendingIncomingTransfers: number;
  todayDispenses: number;
  nearExpiryAtLocation: number;
  recentDispenses: RecentDispenseDTO[];
  incomingTransferSummary: IncomingTransferSummaryDTO[];
}

export interface RecentDispenseDTO {
  dispenseRefId: number;
  itemName: string;
  quantity: number;
  dispenseDate: string;
  destination: string;
}

export interface IncomingTransferSummaryDTO {
  transferOrderId: number;
  fromLocation: string;
  itemCount: number;
  createdDate: string;
  status: string;
}

export interface DispenseRefDTO {
  dispenseRefId: number;
  locationId: number;
  locationName: string;
  itemId: number;
  itemName: string;
  inventoryLotId: number;
  batchNumber: number;
  quantity: number;
  dispenseDate: string;
  status: boolean;
  destination: number;
  destinationName: string;
}

export interface CreateDispenseRefDTO {
  locationId: number;
  itemId: number;
  inventoryLotId: number;
  quantity: number;
  destination: number;
}

export interface IncomingTransferDTO {
  transferOrderId: number;
  fromLocationId: number;
  fromLocationName: string;
  toLocationId: number;
  toLocationName: string;
  createdDate: string;
  status: number;
  statusName: string;
  items: TransferItemDTO[];
}

export interface TransferItemDTO {
  transferItemId: number;
  itemId: number;
  itemName: string;
  inventoryLotId: number;
  batchNumber: number;
  quantity: number;
}

export interface DestinationType {
  destinationTypeId: number;
  type: string;
}
