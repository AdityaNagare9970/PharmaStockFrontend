export interface AuditDto {
  userId:    number;
  action?:   string;
  resource:  string;
  metadata?: string;
}

export interface AuditLog {
  auditId:   number;
  userId:    number;
  action:    string;
  resource:  string;
  timestamp: string;
  metadata?: string;
}

export interface AuditLogResponse {
  result:   boolean;
  message?: string;
}
