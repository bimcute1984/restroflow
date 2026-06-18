export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";
export type OrderType = "dine-in" | "takeaway" | "delivery";
export type PaymentMethod = "cash" | "promptpay" | "credit_card" | "line_pay" | "true_money";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  available: boolean;
  description?: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  tableNumber?: number;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: Date;
  customerName?: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  currentOrderId?: string;
}

export type QueueStatus = "waiting" | "called" | "seated" | "cancelled";

export interface QueueEntry {
  id: string;
  queueNumber: number;
  customerName: string;
  partySize: number;
  phone?: string;
  status: QueueStatus;
  createdAt: Date;
  calledAt?: Date;
  tableId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  costPerUnit: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
}

export interface MenuItemFull extends MenuItem {
  featured: boolean;
  categoryId: string;
  description?: string;
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
  avgPerOrder: number;
}

export interface TopMenuItem {
  menuItem: MenuItem;
  totalQty: number;
  totalRevenue: number;
}

export interface HourlySales {
  hour: number;
  orders: number;
}
