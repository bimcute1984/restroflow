import { DailySales, HourlySales, InventoryItem, MenuCategory, MenuItemFull, MenuItem, Order, QueueEntry, Table, TopMenuItem } from "@/types";

export const mockMenuItems: MenuItem[] = [
  { id: "1", name: "ข้าวผัดกุ้ง", price: 85, category: "อาหารจานหลัก", available: true },
  { id: "2", name: "ต้มยำกุ้ง", price: 120, category: "ซุป", available: true },
  { id: "3", name: "ผัดไทย", price: 75, category: "อาหารจานหลัก", available: true },
  { id: "4", name: "ส้มตำ", price: 65, category: "ยำ/สลัด", available: true },
  { id: "5", name: "ไก่ทอดกระเทียม", price: 95, category: "อาหารจานหลัก", available: true },
  { id: "6", name: "แกงเขียวหวานไก่", price: 90, category: "แกง", available: false },
  { id: "7", name: "น้ำมะนาว", price: 35, category: "เครื่องดื่ม", available: true },
  { id: "8", name: "ชาไทย", price: 40, category: "เครื่องดื่ม", available: true },
  { id: "9", name: "โค้ก", price: 30, category: "เครื่องดื่ม", available: true },
  { id: "10", name: "ข้าวเปล่า", price: 15, category: "เครื่องเคียง", available: true },
];

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    tableNumber: 3,
    type: "dine-in",
    status: "preparing",
    items: [
      { menuItem: mockMenuItems[0], quantity: 2 },
      { menuItem: mockMenuItems[6], quantity: 2 },
    ],
    total: 240,
    createdAt: new Date(Date.now() - 1000 * 60 * 12),
  },
  {
    id: "ORD-002",
    tableNumber: 7,
    type: "dine-in",
    status: "pending",
    items: [
      { menuItem: mockMenuItems[2], quantity: 1 },
      { menuItem: mockMenuItems[3], quantity: 1 },
      { menuItem: mockMenuItems[9], quantity: 2 },
    ],
    total: 170,
    createdAt: new Date(Date.now() - 1000 * 60 * 3),
  },
  {
    id: "ORD-003",
    customerName: "คุณสมชาย",
    type: "takeaway",
    status: "ready",
    items: [
      { menuItem: mockMenuItems[4], quantity: 1 },
      { menuItem: mockMenuItems[7], quantity: 1 },
    ],
    total: 135,
    createdAt: new Date(Date.now() - 1000 * 60 * 25),
  },
];

export const mockTables: Table[] = [
  { id: "t1", number: 1, capacity: 2, status: "available" },
  { id: "t2", number: 2, capacity: 4, status: "available" },
  { id: "t3", number: 3, capacity: 4, status: "occupied", currentOrderId: "ORD-001" },
  { id: "t4", number: 4, capacity: 6, status: "reserved" },
  { id: "t5", number: 5, capacity: 2, status: "available" },
  { id: "t6", number: 6, capacity: 4, status: "cleaning" },
  { id: "t7", number: 7, capacity: 4, status: "occupied", currentOrderId: "ORD-002" },
  { id: "t8", number: 8, capacity: 8, status: "available" },
  { id: "t9", number: 9, capacity: 2, status: "available" },
  { id: "t10", number: 10, capacity: 4, status: "reserved" },
  { id: "t11", number: 11, capacity: 6, status: "available" },
  { id: "t12", number: 12, capacity: 4, status: "available" },
];

export const mockQueue: QueueEntry[] = [
  {
    id: "Q-001",
    queueNumber: 1,
    customerName: "คุณสมหญิง",
    partySize: 2,
    phone: "081-234-5678",
    status: "waiting",
    createdAt: new Date(Date.now() - 1000 * 60 * 18),
  },
  {
    id: "Q-002",
    queueNumber: 2,
    customerName: "คุณมานะ",
    partySize: 4,
    status: "called",
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
    calledAt: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: "Q-003",
    queueNumber: 3,
    customerName: "คุณวิภา",
    partySize: 3,
    phone: "089-876-5432",
    status: "waiting",
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "Q-004",
    queueNumber: 4,
    customerName: "คุณประสิทธิ์",
    partySize: 6,
    status: "waiting",
    createdAt: new Date(Date.now() - 1000 * 60 * 2),
  },
];

export const mockInventory: InventoryItem[] = [
  { id: "i1", name: "กุ้งสด", unit: "กก.", currentStock: 2.5, minStock: 3, costPerUnit: 320 },
  { id: "i2", name: "ไก่สด", unit: "กก.", currentStock: 8, minStock: 5, costPerUnit: 85 },
  { id: "i3", name: "น้ำมันพืช", unit: "ลิตร", currentStock: 4, minStock: 2, costPerUnit: 45 },
  { id: "i4", name: "ข้าวสาร", unit: "กก.", currentStock: 25, minStock: 10, costPerUnit: 35 },
  { id: "i5", name: "กระเทียม", unit: "กก.", currentStock: 0.8, minStock: 1, costPerUnit: 90 },
  { id: "i6", name: "พริก", unit: "กก.", currentStock: 1.2, minStock: 1, costPerUnit: 150 },
  { id: "i7", name: "วุ้นเส้น", unit: "แพ็ก", currentStock: 12, minStock: 5, costPerUnit: 25 },
  { id: "i8", name: "มะนาว", unit: "กก.", currentStock: 3, minStock: 2, costPerUnit: 60 },
  { id: "i9", name: "เส้นก๋วยเตี๋ยว", unit: "กก.", currentStock: 5, minStock: 3, costPerUnit: 40 },
  { id: "i10", name: "น้ำปลา", unit: "ขวด", currentStock: 6, minStock: 3, costPerUnit: 35 },
  { id: "i11", name: "น้ำตาล", unit: "กก.", currentStock: 4, minStock: 2, costPerUnit: 28 },
  { id: "i12", name: "ผักชี", unit: "กก.", currentStock: 0.3, minStock: 0.5, costPerUnit: 120 },
];

// ===== MENU =====

export const mockCategories: MenuCategory[] = [
  { id: "c1", name: "อาหารจานหลัก", order: 1 },
  { id: "c2", name: "ซุป", order: 2 },
  { id: "c3", name: "ยำ/สลัด", order: 3 },
  { id: "c4", name: "แกง", order: 4 },
  { id: "c5", name: "เครื่องดื่ม", order: 5 },
  { id: "c6", name: "เครื่องเคียง", order: 6 },
  { id: "c7", name: "ของหวาน", order: 7 },
];

export const mockMenuFull: MenuItemFull[] = [
  { id: "1", name: "ข้าวผัดกุ้ง", price: 85, category: "อาหารจานหลัก", categoryId: "c1", available: true, featured: true, description: "ข้าวผัดกุ้งสดกรอบ ปรุงรสกลมกล่อม" },
  { id: "2", name: "ต้มยำกุ้ง", price: 120, category: "ซุป", categoryId: "c2", available: true, featured: true, description: "ต้มยำน้ำข้น รสจัดจ้าน" },
  { id: "3", name: "ผัดไทย", price: 75, category: "อาหารจานหลัก", categoryId: "c1", available: true, featured: false, description: "ผัดไทยโบราณ ใส่ถั่วงอก กุยช่าย" },
  { id: "4", name: "ส้มตำ", price: 65, category: "ยำ/สลัด", categoryId: "c3", available: true, featured: false, description: "ส้มตำไทยแบบดั้งเดิม" },
  { id: "5", name: "ไก่ทอดกระเทียม", price: 95, category: "อาหารจานหลัก", categoryId: "c1", available: true, featured: true, description: "ไก่ทอดกรอบ โรยกระเทียมเจียว" },
  { id: "6", name: "แกงเขียวหวานไก่", price: 90, category: "แกง", categoryId: "c4", available: false, featured: false, description: "แกงเขียวหวานหอมกะทิ" },
  { id: "7", name: "น้ำมะนาว", price: 35, category: "เครื่องดื่ม", categoryId: "c5", available: true, featured: false },
  { id: "8", name: "ชาไทย", price: 40, category: "เครื่องดื่ม", categoryId: "c5", available: true, featured: false },
  { id: "9", name: "โค้ก", price: 30, category: "เครื่องดื่ม", categoryId: "c5", available: true, featured: false },
  { id: "10", name: "ข้าวเปล่า", price: 15, category: "เครื่องเคียง", categoryId: "c6", available: true, featured: false },
  { id: "11", name: "ลาบหมู", price: 85, category: "ยำ/สลัด", categoryId: "c3", available: true, featured: false, description: "ลาบหมูสดรสจัด" },
  { id: "12", name: "ทับทิมกรอบ", price: 55, category: "ของหวาน", categoryId: "c7", available: true, featured: true, description: "ทับทิมกรอบในน้ำกะทิเย็น" },
];

// ===== REPORTS / SALES DATA =====

export const mockDailySales: DailySales[] = [
  { date: "2026-06-12", revenue: 4200, orders: 28, avgPerOrder: 150 },
  { date: "2026-06-13", revenue: 5800, orders: 35, avgPerOrder: 166 },
  { date: "2026-06-14", revenue: 3900, orders: 24, avgPerOrder: 163 },
  { date: "2026-06-15", revenue: 6700, orders: 42, avgPerOrder: 160 },
  { date: "2026-06-16", revenue: 7200, orders: 48, avgPerOrder: 150 },
  { date: "2026-06-17", revenue: 8500, orders: 55, avgPerOrder: 155 },
  { date: "2026-06-18", revenue: 3200, orders: 21, avgPerOrder: 152 },
];

export const mockTopMenuItems: TopMenuItem[] = [
  { menuItem: mockMenuFull[0], totalQty: 142, totalRevenue: 12070 },
  { menuItem: mockMenuFull[4], totalQty: 118, totalRevenue: 11210 },
  { menuItem: mockMenuFull[1], totalQty: 95, totalRevenue: 11400 },
  { menuItem: mockMenuFull[2], totalQty: 89, totalRevenue: 6675 },
  { menuItem: mockMenuFull[3], totalQty: 76, totalRevenue: 4940 },
];

export const mockHourlySales: HourlySales[] = [
  { hour: 10, orders: 4 }, { hour: 11, orders: 8 }, { hour: 12, orders: 18 },
  { hour: 13, orders: 22 }, { hour: 14, orders: 12 }, { hour: 15, orders: 6 },
  { hour: 16, orders: 5 }, { hour: 17, orders: 9 }, { hour: 18, orders: 21 },
  { hour: 19, orders: 28 }, { hour: 20, orders: 25 }, { hour: 21, orders: 14 },
];
