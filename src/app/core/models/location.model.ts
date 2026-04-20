export enum LocationTypeEnum {
  MainStore = 20,
  SubStore  = 21,
  OR        = 22,
  ICU       = 23,
  Ward      = 24
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
