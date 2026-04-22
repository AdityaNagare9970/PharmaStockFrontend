export enum LocationTypeEnum {
  MainStore = 1,
  SubStore  = 2,
  OR        = 3,
  ICU       = 4,
  Ward      = 5
}

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
