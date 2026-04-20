export interface Item {
  itemId: number;
  drugId: number;
  packSize: number | null;
  uoM: number;
  conversionToEach: number;
  barcode: string;
  status: boolean;
}

export interface CreateItem {
  drugId: number;
  packSize: number | null;
  uoM: number;
  conversionToEach: number;
  barcode: string;
  status: boolean;
}

export interface ItemCreateResponse {
  success: boolean;
  itemId: number;
  message: string;
}

export interface ItemActionResponse {
  success: boolean;
  message: string;
}
