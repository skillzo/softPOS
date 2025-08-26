export interface TransactionRequest {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  amount: number;
  currency: string;
  merchantId: string;
  reference: string;
}

export interface Transaction extends TransactionRequest {
  id: string;
  status: TransactionStatus;
  reasonCode?: string;
  reasonMessage?: string;
  timestamp: Date;
  processedAt: Date;
}

export type TransactionStatus = "SUCCESS" | "DECLINED";

export interface TransactionResponse {
  status: TransactionStatus;
  transaction: Transaction;
  reasonCode?: string;
  reasonMessage?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface DatabaseRow {
  id: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  amount: number;
  currency: string;
  merchantId: string;
  reference: string;
  status: TransactionStatus;
  reasonCode?: string;
  reasonMessage?: string;
  timestamp: string;
  processedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
}

// Error response types
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
}

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
