export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  uom: string;
  minStockLevel: number;
  isActive: boolean;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  locationCode: string;
}

export interface StockEntry {
  productId: string;
  warehouseId: string;
  quantity: number;
}

export interface LedgerEntry {
  id: string;
  productId: string;
  warehouseId: string;
  changeAmount: number;
  documentType: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  documentId: string;
  createdAt: string;
  userId: string;
}

export interface ReceiptItem {
  productId: string;
  quantity: number;
  warehouseId: string;
}

export interface Receipt {
  id: string;
  supplierName: string;
  status: 'draft' | 'validated';
  items: ReceiptItem[];
  createdAt: string;
  validatedAt?: string;
}

export interface DeliveryItem {
  productId: string;
  quantity: number;
  warehouseId: string;
}

export interface Delivery {
  id: string;
  customerName: string;
  status: 'draft' | 'picking' | 'packed' | 'validated';
  items: DeliveryItem[];
  createdAt: string;
  validatedAt?: string;
}

export interface TransferItem {
  productId: string;
  quantity: number;
}

export interface Transfer {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: 'pending' | 'completed';
  items: TransferItem[];
  createdAt: string;
  completedAt?: string;
}

export interface Adjustment {
  id: string;
  productId: string;
  warehouseId: string;
  countedQuantity: number;
  systemQuantity: number;
  difference: number;
  reason: string;
  createdAt: string;
}
