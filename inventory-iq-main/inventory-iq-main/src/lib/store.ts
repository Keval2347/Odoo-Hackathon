import { Category, Product, Warehouse, StockEntry, LedgerEntry, Receipt, Delivery, Transfer, Adjustment, User } from './types';

function uid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// --- Seed Data ---
const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Electronics' },
  { id: 'cat-2', name: 'Furniture' },
  { id: 'cat-3', name: 'Office Supplies' },
  { id: 'cat-4', name: 'Raw Materials' },
];

const WAREHOUSES: Warehouse[] = [
  { id: 'wh-1', name: 'Main Warehouse', locationCode: 'WH-MAIN' },
  { id: 'wh-2', name: 'East Distribution', locationCode: 'WH-EAST' },
  { id: 'wh-3', name: 'West Storage', locationCode: 'WH-WEST' },
];

const PRODUCTS: Product[] = [
  { id: 'prod-1', sku: 'HP-LAP-001', name: 'HP EliteBook 840 G9', categoryId: 'cat-1', uom: 'pcs', minStockLevel: 10, isActive: true, createdAt: '2025-01-15T10:00:00Z' },
  { id: 'prod-2', sku: 'DEL-MON-002', name: 'Dell UltraSharp 27"', categoryId: 'cat-1', uom: 'pcs', minStockLevel: 5, isActive: true, createdAt: '2025-01-15T10:00:00Z' },
  { id: 'prod-3', sku: 'OFC-DSK-003', name: 'Standing Desk Pro', categoryId: 'cat-2', uom: 'pcs', minStockLevel: 3, isActive: true, createdAt: '2025-02-01T10:00:00Z' },
  { id: 'prod-4', sku: 'OFC-CHR-004', name: 'Ergonomic Chair X1', categoryId: 'cat-2', uom: 'pcs', minStockLevel: 5, isActive: true, createdAt: '2025-02-01T10:00:00Z' },
  { id: 'prod-5', sku: 'SUP-PEN-005', name: 'Premium Pen Set', categoryId: 'cat-3', uom: 'box', minStockLevel: 20, isActive: true, createdAt: '2025-03-01T10:00:00Z' },
  { id: 'prod-6', sku: 'RAW-STL-006', name: 'Steel Sheet 4x8', categoryId: 'cat-4', uom: 'sheet', minStockLevel: 50, isActive: true, createdAt: '2025-03-01T10:00:00Z' },
  { id: 'prod-7', sku: 'HP-LAP-007', name: 'HP ProBook 450 G10', categoryId: 'cat-1', uom: 'pcs', minStockLevel: 8, isActive: true, createdAt: '2025-04-01T10:00:00Z' },
  { id: 'prod-8', sku: 'SUP-PAP-008', name: 'A4 Paper Ream', categoryId: 'cat-3', uom: 'ream', minStockLevel: 100, isActive: true, createdAt: '2025-04-01T10:00:00Z' },
];

const INITIAL_STOCK: StockEntry[] = [
  { productId: 'prod-1', warehouseId: 'wh-1', quantity: 33 },
  { productId: 'prod-1', warehouseId: 'wh-2', quantity: 12 },
  { productId: 'prod-2', warehouseId: 'wh-1', quantity: 18 },
  { productId: 'prod-3', warehouseId: 'wh-1', quantity: 7 },
  { productId: 'prod-4', warehouseId: 'wh-1', quantity: 4 },
  { productId: 'prod-4', warehouseId: 'wh-3', quantity: 2 },
  { productId: 'prod-5', warehouseId: 'wh-1', quantity: 15 },
  { productId: 'prod-6', warehouseId: 'wh-3', quantity: 120 },
  { productId: 'prod-7', warehouseId: 'wh-1', quantity: 5 },
  { productId: 'prod-8', warehouseId: 'wh-1', quantity: 250 },
  { productId: 'prod-8', warehouseId: 'wh-2', quantity: 80 },
];

const INITIAL_LEDGER: LedgerEntry[] = [
  { id: uid(), productId: 'prod-1', warehouseId: 'wh-1', changeAmount: 50, documentType: 'receipt', documentId: 'init', createdAt: '2025-01-20T10:00:00Z', userId: 'user-1' },
  { id: uid(), productId: 'prod-1', warehouseId: 'wh-1', changeAmount: -5, documentType: 'delivery', documentId: 'init', createdAt: '2025-02-10T10:00:00Z', userId: 'user-1' },
  { id: uid(), productId: 'prod-1', warehouseId: 'wh-1', changeAmount: -12, documentType: 'transfer', documentId: 'init', createdAt: '2025-03-01T10:00:00Z', userId: 'user-1' },
  { id: uid(), productId: 'prod-1', warehouseId: 'wh-2', changeAmount: 12, documentType: 'transfer', documentId: 'init', createdAt: '2025-03-01T10:00:00Z', userId: 'user-1' },
  { id: uid(), productId: 'prod-2', warehouseId: 'wh-1', changeAmount: 20, documentType: 'receipt', documentId: 'init', createdAt: '2025-01-25T10:00:00Z', userId: 'user-1' },
  { id: uid(), productId: 'prod-2', warehouseId: 'wh-1', changeAmount: -2, documentType: 'delivery', documentId: 'init', createdAt: '2025-02-15T10:00:00Z', userId: 'user-1' },
  { id: uid(), productId: 'prod-6', warehouseId: 'wh-3', changeAmount: 150, documentType: 'receipt', documentId: 'init', createdAt: '2025-03-05T10:00:00Z', userId: 'user-1' },
  { id: uid(), productId: 'prod-6', warehouseId: 'wh-3', changeAmount: -30, documentType: 'delivery', documentId: 'init', createdAt: '2025-03-20T10:00:00Z', userId: 'user-1' },
];

const INITIAL_USERS: User[] = [
  { id: 'user-1', email: 'admin@coreinventory.com', name: 'admin', role: 'admin' },
];

// --- Store Class ---
class InventoryStore {
  users: User[] = [...INITIAL_USERS];
  categories: Category[] = [...CATEGORIES];
  products: Product[] = [...PRODUCTS];
  warehouses: Warehouse[] = [...WAREHOUSES];
  stock: StockEntry[] = [...INITIAL_STOCK];
  ledger: LedgerEntry[] = [...INITIAL_LEDGER];
  receipts: Receipt[] = [];
  deliveries: Delivery[] = [];
  transfers: Transfer[] = [];
  adjustments: Adjustment[] = [];
  currentUser: User | null = null;
  version = 0;
  private listeners: Set<() => void> = new Set();

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.version++;
    this.listeners.forEach(fn => fn());
  }

  // --- Reset to fresh seed data ---
  private resetData() {
    this.categories = [...CATEGORIES];
    this.products = PRODUCTS.map(p => ({ ...p }));
    this.warehouses = [...WAREHOUSES];
    this.stock = INITIAL_STOCK.map(s => ({ ...s }));
    this.ledger = INITIAL_LEDGER.map(l => ({ ...l }));
    this.receipts = [];
    this.deliveries = [];
    this.transfers = [];
    this.adjustments = [];
  }

  // --- Auth ---
  login(email: string, _password: string): User {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid email. User is not registered.');
    }
    this.resetData();
    this.currentUser = user;
    this.notify();
    return user;
  }

  signup(email: string, name: string, _password: string): User {
    const existing = this.users.find(u => u.email === email);
    if (existing) {
      throw new Error('Email is already registered.');
    }
    const user: User = { id: uid(), email, name, role: 'staff' };
    this.users.push(user);
    this.resetData();
    this.currentUser = user;
    this.notify();
    return user;
  }

  logout() {
    this.currentUser = null;
    this.notify();
  }

  // --- Stock Helpers ---
  getStock(productId: string, warehouseId: string): number {
    return this.stock.find(s => s.productId === productId && s.warehouseId === warehouseId)?.quantity ?? 0;
  }

  getTotalStock(productId: string): number {
    return this.stock.filter(s => s.productId === productId).reduce((sum, s) => sum + s.quantity, 0);
  }

  private updateStock(productId: string, warehouseId: string, delta: number) {
    const entry = this.stock.find(s => s.productId === productId && s.warehouseId === warehouseId);
    if (entry) {
      entry.quantity += delta;
    } else {
      this.stock.push({ productId, warehouseId, quantity: delta });
    }
  }

  private addLedger(productId: string, warehouseId: string, changeAmount: number, documentType: LedgerEntry['documentType'], documentId: string) {
    this.ledger.push({
      id: uid(),
      productId,
      warehouseId,
      changeAmount,
      documentType,
      documentId,
      createdAt: now(),
      userId: this.currentUser?.id ?? 'system',
    });
  }

  // --- Products ---
  addProduct(p: Omit<Product, 'id' | 'createdAt' | 'isActive'>): Product {
    const product: Product = { ...p, id: uid(), createdAt: now(), isActive: true };
    this.products.push(product);
    this.notify();
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.products[idx] = { ...this.products[idx], ...updates };
      this.notify();
    }
  }

  // --- Receipts ---
  createReceipt(supplierName: string, items: Receipt['items']): Receipt {
    const receipt: Receipt = { id: uid(), supplierName, status: 'draft', items, createdAt: now() };
    this.receipts.push(receipt);
    this.notify();
    return receipt;
  }

  validateReceipt(id: string) {
    const receipt = this.receipts.find(r => r.id === id);
    if (!receipt || receipt.status === 'validated') return;
    receipt.status = 'validated';
    receipt.validatedAt = now();
    for (const item of receipt.items) {
      this.updateStock(item.productId, item.warehouseId, item.quantity);
      this.addLedger(item.productId, item.warehouseId, item.quantity, 'receipt', id);
    }
    this.notify();
  }

  // --- Deliveries ---
  createDelivery(customerName: string, items: Delivery['items']): Delivery {
    const delivery: Delivery = { id: uid(), customerName, status: 'draft', items, createdAt: now() };
    this.deliveries.push(delivery);
    this.notify();
    return delivery;
  }

  updateDeliveryStatus(id: string, status: Delivery['status']) {
    const delivery = this.deliveries.find(d => d.id === id);
    if (!delivery) return;
    delivery.status = status;
    if (status === 'validated') {
      delivery.validatedAt = now();
      for (const item of delivery.items) {
        this.updateStock(item.productId, item.warehouseId, -item.quantity);
        this.addLedger(item.productId, item.warehouseId, -item.quantity, 'delivery', id);
      }
    }
    this.notify();
  }

  // --- Transfers ---
  createTransfer(fromWarehouseId: string, toWarehouseId: string, items: Transfer['items']): Transfer {
    const transfer: Transfer = { id: uid(), fromWarehouseId, toWarehouseId, status: 'pending', items, createdAt: now() };
    this.transfers.push(transfer);
    this.notify();
    return transfer;
  }

  completeTransfer(id: string) {
    const transfer = this.transfers.find(t => t.id === id);
    if (!transfer || transfer.status === 'completed') return;
    transfer.status = 'completed';
    transfer.completedAt = now();
    for (const item of transfer.items) {
      this.updateStock(item.productId, transfer.fromWarehouseId, -item.quantity);
      this.updateStock(item.productId, transfer.toWarehouseId, item.quantity);
      this.addLedger(item.productId, transfer.fromWarehouseId, -item.quantity, 'transfer', id);
      this.addLedger(item.productId, transfer.toWarehouseId, item.quantity, 'transfer', id);
    }
    this.notify();
  }

  // --- Adjustments ---
  createAdjustment(productId: string, warehouseId: string, countedQuantity: number, reason: string): Adjustment {
    const systemQuantity = this.getStock(productId, warehouseId);
    const difference = countedQuantity - systemQuantity;
    const adj: Adjustment = { id: uid(), productId, warehouseId, countedQuantity, systemQuantity, difference, reason, createdAt: now() };
    this.adjustments.push(adj);
    this.updateStock(productId, warehouseId, difference);
    this.addLedger(productId, warehouseId, difference, 'adjustment', adj.id);
    this.notify();
    return adj;
  }

  // --- Analytics ---
  getLowStockProducts(): Product[] {
    return this.products.filter(p => p.isActive && this.getTotalStock(p.id) <= p.minStockLevel);
  }

  getOutOfStockProducts(): Product[] {
    return this.products.filter(p => p.isActive && this.getTotalStock(p.id) === 0);
  }

  getTotalStockValue(): number {
    return this.stock.reduce((sum, s) => sum + s.quantity, 0);
  }

  getStockVelocity(): { date: string; inbound: number; outbound: number }[] {
    const days: Record<string, { inbound: number; outbound: number }> = {};
    for (const entry of this.ledger) {
      const date = entry.createdAt.slice(0, 10);
      if (!days[date]) days[date] = { inbound: 0, outbound: 0 };
      if (entry.changeAmount > 0) days[date].inbound += entry.changeAmount;
      else days[date].outbound += Math.abs(entry.changeAmount);
    }
    return Object.entries(days).sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ date, ...v }));
  }
}

export const store = new InventoryStore();
