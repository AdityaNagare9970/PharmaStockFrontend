export interface Drug {
  drugId: number;
  genericName: string;
  brandName: string;
  strength: string;
  form: number;
  atccode: string;
  controlClass: number;
  storageClass: number;
  status: boolean;
}

export interface CreateDrug {
  genericName: string;
  brandName: string;
  strength: string;
  form: number;
  atccode: string;
  controlClass: number;
  storageClass: number;
  status: boolean;
}

export interface UpdateDrug {
  genericName: string;
  brandName: string;
  strength: string;
  form: number;
  atccode: string;
  controlClass: number;
  storageClass: number;
  status: boolean;
}
