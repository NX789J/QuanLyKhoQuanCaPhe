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

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRoleEnum;
}

export interface IngredientCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Ingredient {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  category?: IngredientCategory;
  baseUnit: string;
  minStockLevel: number;
  currentStock: number;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Beverage {
  id: string;
  code: string;
  name: string;
  sellingPrice: number;
  estimatedCost: number;
  recipeItems?: Array<{
    id: string;
    ingredientId: string;
    ingredient?: Ingredient;
    quantity: number;
    unit: string;
  }>;
}

export interface DashboardSummary {
  totalIngredients: number;
  totalBeverages: number;
  totalSuppliers: number;
  lowStockCount: number;
  expiringBatchCount: number;
  totalStockValue: number;
}