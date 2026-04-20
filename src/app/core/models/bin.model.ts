export interface Bin {
  binId: number;
  locationId: number;
  locationName: string;
  code: string;
  binStorageClassId: number;
  storageClass: string;
  isQuarantine: boolean;
  maxCapacity: number;
  isActive: boolean;
}

export interface CreateBin {
  locationId: number;
  code: string;
  binStorageClassId: number;
  isQuarantine: boolean;
  maxCapacity: number;
}

export interface UpdateBin {
  binStorageClassId: number | null;
  isQuarantine: boolean | null;
  isActive: boolean | null;
  maxCapacity: number | null;
}

export interface BinStorageClass {
  id: number;
  name: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
