// backend/src/common/enums/system.enum.ts
export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  STAFF = 'STAFF',
}

export enum StockReceiptStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum StockIssueStatus {
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum BatchStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DEPLETED = 'DEPLETED',
}

export enum TransactionType {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  ADJUSTMENT = 'ADJUSTMENT',
  CANCEL_IMPORT = 'CANCEL_IMPORT',
  CANCEL_EXPORT = 'CANCEL_EXPORT',
}