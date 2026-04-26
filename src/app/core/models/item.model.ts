export interface Item {
  itemId: number;
  drugId: number;
  drugName: string;
  packSize: number | null;
  uoMId: number;
  uoMCode: string;
  conversionToEach: number;
  barcode: string;
}

export interface CreateItem {
  drugId: number;
  packSize: number | null;
  uoMId: number;
  conversionToEach: number;
  barcode: string;
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
