export interface Drug {
  drugId: number;
  genericName: string;
  brandName: string;
  strength: string;
  atccode: string;
  form: number;
  storageClass: number;
  controlClass: number;
  status: boolean;
}

export interface CreateDrugDTO {
  genericName: string;
  brandName: string;
  strength: string;
  atccode: string;
  form: number;
  storageClass: number;
  controlClass: number;
  status: boolean;
}

export interface UpdateDrugDTO {
  genericName: string;
  brandName: string;
  strength: string;
  atccode: string;
  form: number;
  storageClass: number;
  controlClass: number;
  status: boolean;
}

export interface DrugFilterDTO {
  genericName?: string;
  storageClass?: number;
  controlClass?: number;
  status?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
