export interface Vendor {
  vendorId: number;
  name: string;
  contactInfo: string;
  email: string;
  phone: string;
  rating: number;
  statusId: boolean;
}

export interface VendorRequest {
  name: string;
  contactInfo: string;
  email: string;
  phone: string;
  rating: number;
  statusId: boolean;
}
