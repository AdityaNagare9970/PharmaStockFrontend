export interface ItemLookup {
  itemId: number;
  name: string;
  strength: string;
}

export interface PharmLocation {
  locationId: number;
  name: string;
  locationTypeId: number;
}

export interface InventoryDashboardStats {
  totalInventoryLots: number;
  expiredItems: number;
  openTransferOrders: number;
  pendingReplenishments: number;
  totalLocations: number;
  lowStockItems: number;
  recentTransfers: RecentTransfer[];
}

export interface RecentTransfer {
  transferOrderId: number;
  fromLocation: string;
  toLocation: string;
  createdDate: string;
  status: string;
}


export interface InventoryLot {
  inventoryLotId: number;
  itemId: number;
  itemName: string | null;
  batchNumber: string;
  expiryDate: string;
  manufacturerId: number | null;
  status: number;
}

export interface ExpiryWatch {
  expiryWatchId: number;
  inventoryLotId: number;
  batchNumber: number;
  itemId: number;
  itemName: string;
  expiryDate: string;
  daysToExpire: number;
  flagDate: string;
  status: boolean;
}

export interface TransferOrder {
  transferOrderId: number;
  fromLocationId: number;
  toLocationId: number;
  createdDate: string;
  status: number;
}

export interface ReplenishmentRequest {
  replenishmentRequestId: number;
  locationId: number;
  locationName: string;
  itemId: number;
  itemName: string;
  suggestedQty: number;
  createdDate: string;
  ruleId: number;
  status: number;
  statusName: string;
}

export interface ReplenishmentRule {
  replenishmentRuleId: number;
  locationId: number;
  locationName: string;
  itemId: number;
  itemName: string;
  minLevel: number;
  maxLevel: number;
  parLevel: number;
  reviewCycle: boolean;
}

export interface InventoryBalance {
  inventoryBalanceId: number;
  locationId: number;
  locationName: string;
  binId: number;
  binCode: string;
  itemId: number;
  itemName: string;
  inventoryLotId: number;
  batchNumber: string;
  expiryDate: string | null;
  quantityOnHand: number;
  reservedQty: number;
  availableQty: number;
}
