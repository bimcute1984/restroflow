import { createClient } from "./client";
import type {
  Order, MenuItem, MenuItemFull, MenuCategory,
  InventoryItem, Table, QueueEntry,
  OrderStatus, OrderType, QueueStatus,
} from "@/types";

function sb() { return createClient(); }

function genId(): string {
  return crypto.randomUUID();
}

// ── Enum converters (DB uses UPPER_CASE, app uses lower-case) ──

function toAppOrderStatus(s: string): OrderStatus {
  return s.toLowerCase() as OrderStatus;
}
function toDbOrderStatus(s: OrderStatus): string {
  return s.toUpperCase();
}
function toAppOrderType(t: string): OrderType {
  if (t === "DINE_IN") return "dine-in";
  return t.toLowerCase() as OrderType;
}
function toDbOrderType(t: OrderType): string {
  if (t === "dine-in") return "DINE_IN";
  return t.toUpperCase();
}
function toAppTableStatus(s: string): Table["status"] {
  return s.toLowerCase() as Table["status"];
}
function toAppQueueStatus(s: string): QueueStatus {
  return s.toLowerCase() as QueueStatus;
}

// ── Menu ──

export async function fetchCategories(): Promise<MenuCategory[]> {
  const { data, error } = await sb()
    .from("MenuCategory")
    .select("*")
    .order("order");
  if (error) throw error;
  return data ?? [];
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await sb()
    .from("MenuItem")
    .select("*, category:MenuCategory(name)")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((d: Record<string, unknown>) => ({
    id: d.id as string,
    name: d.name as string,
    price: d.price as number,
    image: d.image as string | undefined,
    category: (d.category as { name: string })?.name ?? "",
    available: d.available as boolean,
    description: d.description as string | undefined,
  }));
}

export async function fetchMenuItemsFull(): Promise<MenuItemFull[]> {
  const { data, error } = await sb()
    .from("MenuItem")
    .select("*, category:MenuCategory(name)")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((d: Record<string, unknown>) => ({
    id: d.id as string,
    name: d.name as string,
    price: d.price as number,
    image: d.image as string | undefined,
    category: (d.category as { name: string })?.name ?? "",
    categoryId: d.categoryId as string,
    available: d.available as boolean,
    featured: d.featured as boolean,
    description: d.description as string | undefined,
  }));
}

export async function upsertMenuItem(item: MenuItemFull): Promise<void> {
  const { error } = await sb().from("MenuItem").upsert({
    id: item.id,
    name: item.name,
    price: item.price,
    categoryId: item.categoryId,
    available: item.available,
    featured: item.featured,
    description: item.description || null,
    updatedAt: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function toggleMenuAvailability(id: string, available: boolean): Promise<void> {
  const { error } = await sb()
    .from("MenuItem")
    .update({ available, updatedAt: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// ── Orders ──

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await sb()
    .from("Order")
    .select(`
      *,
      table:Table(number),
      items:OrderItem(
        id,
        quantity,
        unitPrice,
        note,
        menuItem:MenuItem(id, name, price, image, available, categoryId, category:MenuCategory(name))
      )
    `)
    .in("status", ["PENDING", "PREPARING", "READY", "COMPLETED"])
    .order("createdAt", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((d: Record<string, unknown>) => {
    const items = (d.items as Array<Record<string, unknown>>) ?? [];
    return {
      id: d.id as string,
      tableNumber: (d.table as { number: number } | null)?.number,
      type: toAppOrderType(d.type as string),
      status: toAppOrderStatus(d.status as string),
      customerName: d.customerName as string | undefined,
      total: d.total as number,
      createdAt: new Date(d.createdAt as string),
      items: items.map((oi) => {
        const mi = oi.menuItem as Record<string, unknown>;
        const cat = mi?.category as { name: string } | null;
        return {
          menuItem: {
            id: mi?.id as string,
            name: mi?.name as string,
            price: mi?.price as number,
            image: mi?.image as string | undefined,
            category: cat?.name ?? "",
            available: mi?.available as boolean,
          },
          quantity: oi.quantity as number,
          note: oi.note as string | undefined,
        };
      }),
    };
  });
}

export async function createOrder(order: {
  type: OrderType;
  tableNumber?: number;
  customerName?: string;
  items: { menuItemId: string; quantity: number; unitPrice: number; note?: string }[];
  total: number;
}): Promise<string> {
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

  let tableId: string | null = null;
  if (order.tableNumber) {
    const { data } = await sb()
      .from("Table")
      .select("id")
      .eq("number", order.tableNumber)
      .single();
    tableId = data?.id ?? null;
  }

  const orderId = genId();
  const { error: orderError } = await sb()
    .from("Order")
    .insert({
      id: orderId,
      orderNumber,
      type: toDbOrderType(order.type),
      status: "PENDING",
      tableId,
      customerName: order.customerName || null,
      total: order.total,
      updatedAt: new Date().toISOString(),
    });
  if (orderError) throw orderError;

  if (order.items.length > 0) {
    const { error: itemsError } = await sb().from("OrderItem").insert(
      order.items.map((i) => ({
        id: genId(),
        orderId,
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        note: i.note || null,
      }))
    );
    if (itemsError) throw itemsError;
  }

  if (tableId) {
    await sb().from("Table").update({ status: "OCCUPIED" }).eq("id", tableId);
  }

  return orderId;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const update: Record<string, unknown> = {
    status: toDbOrderStatus(status),
    updatedAt: new Date().toISOString(),
  };
  if (status === "completed") {
    update.completedAt = new Date().toISOString();
  }
  const { error } = await sb().from("Order").update(update).eq("id", id);
  if (error) throw error;
}

// ── Inventory ──

export async function fetchInventory(): Promise<InventoryItem[]> {
  const { data, error } = await sb()
    .from("InventoryItem")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((d: Record<string, unknown>) => ({
    id: d.id as string,
    name: d.name as string,
    unit: d.unit as string,
    currentStock: d.currentStock as number,
    minStock: d.minStock as number,
    costPerUnit: d.costPerUnit as number,
  }));
}

export async function createInventoryItem(item: Omit<InventoryItem, "id">): Promise<string> {
  const id = genId();
  const { error } = await sb().from("InventoryItem").insert({
    id,
    name: item.name,
    unit: item.unit,
    currentStock: item.currentStock,
    minStock: item.minStock,
    costPerUnit: item.costPerUnit,
    updatedAt: new Date().toISOString(),
  });
  if (error) throw error;
  return id;
}

export async function updateInventoryItem(item: InventoryItem): Promise<void> {
  const { error } = await sb().from("InventoryItem").update({
    name: item.name,
    unit: item.unit,
    currentStock: item.currentStock,
    minStock: item.minStock,
    costPerUnit: item.costPerUnit,
    updatedAt: new Date().toISOString(),
  }).eq("id", item.id);
  if (error) throw error;
}

export async function receiveStock(id: string, amount: number): Promise<void> {
  const { data } = await sb()
    .from("InventoryItem")
    .select("currentStock")
    .eq("id", id)
    .single();
  if (!data) throw new Error("Item not found");

  const newStock = Math.round(((data.currentStock as number) + amount) * 10) / 10;

  const { error } = await sb().from("InventoryItem").update({
    currentStock: newStock,
    updatedAt: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw error;

  await sb().from("StockMovement").insert({
    id: genId(),
    inventoryItemId: id,
    type: "IN",
    quantity: amount,
  });
}

// ── Tables ──

export async function fetchTables(): Promise<Table[]> {
  const { data, error } = await sb()
    .from("Table")
    .select("*")
    .order("number");
  if (error) throw error;
  return (data ?? []).map((d: Record<string, unknown>) => ({
    id: d.id as string,
    number: d.number as number,
    capacity: d.capacity as number,
    status: toAppTableStatus(d.status as string),
  }));
}

export async function updateTableStatus(id: string, status: Table["status"]): Promise<void> {
  const { error } = await sb()
    .from("Table")
    .update({ status: status.toUpperCase() })
    .eq("id", id);
  if (error) throw error;
}

// ── Queue ──

export async function fetchQueue(): Promise<QueueEntry[]> {
  const { data, error } = await sb()
    .from("QueueEntry")
    .select("*")
    .in("status", ["WAITING", "CALLED"])
    .order("createdAt");
  if (error) throw error;
  return (data ?? []).map((d: Record<string, unknown>) => ({
    id: d.id as string,
    queueNumber: d.queueNumber as number,
    customerName: d.customerName as string,
    partySize: d.partySize as number,
    phone: d.phone as string | undefined,
    status: toAppQueueStatus(d.status as string),
    createdAt: new Date(d.createdAt as string),
    calledAt: d.calledAt ? new Date(d.calledAt as string) : undefined,
    tableId: d.tableId as string | undefined,
  }));
}

export async function createQueueEntry(entry: {
  queueNumber: number;
  customerName: string;
  partySize: number;
  phone?: string;
}): Promise<string> {
  const id = genId();
  const { error } = await sb()
    .from("QueueEntry")
    .insert({
      id,
      queueNumber: entry.queueNumber,
      customerName: entry.customerName,
      partySize: entry.partySize,
      phone: entry.phone || null,
      status: "WAITING",
    });
  if (error) throw error;
  return id;
}

export async function updateQueueStatus(id: string, status: QueueStatus, tableId?: string): Promise<void> {
  const update: Record<string, unknown> = {
    status: status.toUpperCase(),
  };
  if (status === "called") update.calledAt = new Date().toISOString();
  if (status === "seated") {
    update.seatedAt = new Date().toISOString();
    if (tableId) update.tableId = tableId;
  }
  const { error } = await sb().from("QueueEntry").update(update).eq("id", id);
  if (error) throw error;
}

export async function getNextQueueNumber(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data } = await sb()
    .from("QueueEntry")
    .select("queueNumber")
    .gte("createdAt", today.toISOString())
    .order("queueNumber", { ascending: false })
    .limit(1);
  return (data && data.length > 0 ? (data[0].queueNumber as number) : 0) + 1;
}

// ── Reports ──

export interface DailySalesRow {
  date: string;
  revenue: number;
  orders: number;
  avgPerOrder: number;
}

export interface TopMenuRow {
  menuItemId: string;
  name: string;
  category: string;
  totalQty: number;
  totalRevenue: number;
}

export interface HourlySalesRow {
  hour: number;
  orders: number;
}

export async function fetchDailySales(days: number = 7): Promise<DailySalesRow[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await sb()
    .from("Order")
    .select("total, createdAt")
    .eq("status", "COMPLETED")
    .gte("createdAt", since.toISOString())
    .order("createdAt");
  if (error) throw error;

  const byDate: Record<string, { revenue: number; orders: number }> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().slice(0, 10);
    byDate[key] = { revenue: 0, orders: 0 };
  }

  for (const row of data ?? []) {
    const key = (row.createdAt as string).slice(0, 10);
    if (byDate[key]) {
      byDate[key].revenue += row.total as number;
      byDate[key].orders += 1;
    }
  }

  return Object.entries(byDate).map(([date, v]) => ({
    date,
    revenue: Math.round(v.revenue),
    orders: v.orders,
    avgPerOrder: v.orders > 0 ? Math.round(v.revenue / v.orders) : 0,
  }));
}

export async function fetchTopMenuItems(days: number = 7, limit: number = 5): Promise<TopMenuRow[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await sb()
    .from("OrderItem")
    .select(`
      quantity, unitPrice, menuItemId,
      menuItem:MenuItem(name, category:MenuCategory(name)),
      order:Order!inner(status, createdAt)
    `)
    .eq("order.status", "COMPLETED")
    .gte("order.createdAt", since.toISOString());
  if (error) throw error;

  const map: Record<string, TopMenuRow> = {};
  for (const row of data ?? []) {
    const id = row.menuItemId as string;
    const mi = row.menuItem as unknown as Record<string, unknown>;
    const cat = mi?.category as { name: string } | null;
    if (!map[id]) {
      map[id] = {
        menuItemId: id,
        name: (mi?.name as string) ?? "",
        category: cat?.name ?? "",
        totalQty: 0,
        totalRevenue: 0,
      };
    }
    map[id].totalQty += row.quantity as number;
    map[id].totalRevenue += (row.quantity as number) * (row.unitPrice as number);
  }

  return Object.values(map)
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, limit);
}

export async function fetchHourlySales(days: number = 7): Promise<HourlySalesRow[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await sb()
    .from("Order")
    .select("createdAt")
    .eq("status", "COMPLETED")
    .gte("createdAt", since.toISOString());
  if (error) throw error;

  const hours: number[] = Array(24).fill(0);
  for (const row of data ?? []) {
    const h = new Date(row.createdAt as string).getHours();
    hours[h]++;
  }

  return hours
    .map((orders, hour) => ({ hour, orders }))
    .filter((h) => h.hour >= 8 && h.hour <= 22);
}

export async function fetchOrderHistory(limit: number = 50): Promise<Order[]> {
  const { data, error } = await sb()
    .from("Order")
    .select(`
      *,
      table:Table(number),
      items:OrderItem(
        id, quantity, unitPrice, note,
        menuItem:MenuItem(id, name, price, image, available, categoryId, category:MenuCategory(name))
      )
    `)
    .in("status", ["COMPLETED", "CANCELLED"])
    .order("createdAt", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((d: Record<string, unknown>) => {
    const items = (d.items as Array<Record<string, unknown>>) ?? [];
    return {
      id: d.id as string,
      tableNumber: (d.table as { number: number } | null)?.number,
      type: toAppOrderType(d.type as string),
      status: toAppOrderStatus(d.status as string),
      customerName: d.customerName as string | undefined,
      total: d.total as number,
      createdAt: new Date(d.createdAt as string),
      items: items.map((oi) => {
        const mi = oi.menuItem as Record<string, unknown>;
        const cat = mi?.category as { name: string } | null;
        return {
          menuItem: {
            id: mi?.id as string,
            name: mi?.name as string,
            price: mi?.price as number,
            image: mi?.image as string | undefined,
            category: cat?.name ?? "",
            available: mi?.available as boolean,
          },
          quantity: oi.quantity as number,
          note: oi.note as string | undefined,
        };
      }),
    };
  });
}

// ── Recipes ──

export interface RecipeItemRow {
  id: string;
  menuItemId: string;
  inventoryItemId: string;
  quantity: number;
  inventoryName?: string;
  inventoryUnit?: string;
}

export async function fetchRecipeForMenuItem(menuItemId: string): Promise<RecipeItemRow[]> {
  const { data, error } = await sb()
    .from("RecipeItem")
    .select("*, inventoryItem:InventoryItem(name, unit)")
    .eq("menuItemId", menuItemId);
  if (error) throw error;
  return (data ?? []).map((d: Record<string, unknown>) => {
    const inv = d.inventoryItem as Record<string, unknown> | null;
    return {
      id: d.id as string,
      menuItemId: d.menuItemId as string,
      inventoryItemId: d.inventoryItemId as string,
      quantity: d.quantity as number,
      inventoryName: inv?.name as string | undefined,
      inventoryUnit: inv?.unit as string | undefined,
    };
  });
}

export async function saveRecipe(menuItemId: string, items: { inventoryItemId: string; quantity: number }[]): Promise<void> {
  const { error: delError } = await sb()
    .from("RecipeItem")
    .delete()
    .eq("menuItemId", menuItemId);
  if (delError) throw delError;

  if (items.length > 0) {
    const { error } = await sb().from("RecipeItem").insert(
      items.map((i) => ({
        id: genId(),
        menuItemId,
        inventoryItemId: i.inventoryItemId,
        quantity: i.quantity,
      }))
    );
    if (error) throw error;
  }
}

export async function deductStockForOrder(orderId: string): Promise<void> {
  const { data: orderItems, error } = await sb()
    .from("OrderItem")
    .select("menuItemId, quantity")
    .eq("orderId", orderId);
  if (error) throw error;

  for (const oi of orderItems ?? []) {
    const { data: recipes } = await sb()
      .from("RecipeItem")
      .select("inventoryItemId, quantity")
      .eq("menuItemId", oi.menuItemId as string);

    for (const recipe of recipes ?? []) {
      const deductAmount = (recipe.quantity as number) * (oi.quantity as number);
      const { data: inv } = await sb()
        .from("InventoryItem")
        .select("currentStock")
        .eq("id", recipe.inventoryItemId as string)
        .single();
      if (!inv) continue;

      const newStock = Math.max(0, Math.round(((inv.currentStock as number) - deductAmount) * 10) / 10);
      await sb().from("InventoryItem").update({
        currentStock: newStock,
        updatedAt: new Date().toISOString(),
      }).eq("id", recipe.inventoryItemId as string);

      await sb().from("StockMovement").insert({
        id: genId(),
        inventoryItemId: recipe.inventoryItemId as string,
        type: "OUT",
        quantity: deductAmount,
        note: `Order ${orderId.substring(0, 10)}`,
      });
    }
  }
}

export async function cancelOrder(id: string): Promise<void> {
  const { data: order } = await sb()
    .from("Order")
    .select("tableId")
    .eq("id", id)
    .single();

  const { error } = await sb()
    .from("Order")
    .update({ status: "CANCELLED", updatedAt: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  if (order?.tableId) {
    await sb().from("Table").update({ status: "AVAILABLE" }).eq("id", order.tableId);
  }
}
