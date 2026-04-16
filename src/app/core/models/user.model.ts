export interface UserRole {
  roleId: number;
  roleType: string;
}

// Fallback map used if roles API is unavailable
export const UserRoleNames: Record<number, string> = {
  6:  'Admin',
  7:  'Procurement Officer',
  8:  'Inventory Controller',
  9:  'Quality Officer',
  10: 'Pharmacist'
};

export interface User {
  userId: number;
  username: string;
  roleId: number;
  email: string;
  phone: string;
  statusId: boolean;
  createdOn?: string;
  createdBy?: string;
  updatedOn?: string;
  updatedBy?: string;
}

// Single DTO used for both Create (isCreate=true) and Update (isCreate=false)
export interface UpsertUser {
  userId: number;      // 0 for create, real id for update
  username: string;
  roleId: number;
  email: string;
  phone: string;
  adminName: string;
  isCreate: boolean;
}
