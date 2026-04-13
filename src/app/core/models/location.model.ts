export interface Location {
  locationId: number;
  name: string;
  locationTypeId: number;
  parentLocationId: number | null;
  statusId: boolean;
}

export interface CreateLocation {
  name: string;
  locationTypeId: number;
  parentLocationId: number | null;
  statusId: boolean;
}

export interface UpdateLocation {
  locationId: number;
  name: string;
  locationTypeId: number;
  parentLocationId: number | null;
  statusId: boolean;
}
