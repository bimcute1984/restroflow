import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import "dotenv/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws as unknown as typeof WebSocket } }
);

async function seed() {
  console.log("Seeding database...");

  // 1. Menu Categories
  const categories = [
    { id: "c1", name: "อาหารจานหลัก", order: 1 },
    { id: "c2", name: "ซุป", order: 2 },
    { id: "c3", name: "ยำ/สลัด", order: 3 },
    { id: "c4", name: "แกง", order: 4 },
    { id: "c5", name: "เครื่องดื่ม", order: 5 },
    { id: "c6", name: "เครื่องเคียง", order: 6 },
    { id: "c7", name: "ของหวาน", order: 7 },
  ];

  const { error: catError } = await supabase.from("MenuCategory").upsert(categories, { onConflict: "id" });
  if (catError) console.error("MenuCategory error:", catError);
  else console.log("✓ MenuCategory seeded");

  // 2. Menu Items
  const now = new Date().toISOString();
  const menuItems = [
    { id: "m1", name: "ข้าวผัดกุ้ง", price: 85, categoryId: "c1", available: true, featured: true, description: "ข้าวผัดกุ้งสดกรอบ ปรุงรสกลมกล่อม", updatedAt: now },
    { id: "m2", name: "ต้มยำกุ้ง", price: 120, categoryId: "c2", available: true, featured: true, description: "ต้มยำน้ำข้น รสจัดจ้าน", updatedAt: now },
    { id: "m3", name: "ผัดไทย", price: 75, categoryId: "c1", available: true, featured: false, description: "ผัดไทยโบราณ ใส่ถั่วงอก กุยช่าย", updatedAt: now },
    { id: "m4", name: "ส้มตำ", price: 65, categoryId: "c3", available: true, featured: false, description: "ส้มตำไทยแบบดั้งเดิม", updatedAt: now },
    { id: "m5", name: "ไก่ทอดกระเทียม", price: 95, categoryId: "c1", available: true, featured: true, description: "ไก่ทอดกรอบ โรยกระเทียมเจียว", updatedAt: now },
    { id: "m6", name: "แกงเขียวหวานไก่", price: 90, categoryId: "c4", available: false, featured: false, description: "แกงเขียวหวานหอมกะทิ", updatedAt: now },
    { id: "m7", name: "น้ำมะนาว", price: 35, categoryId: "c5", available: true, featured: false, updatedAt: now },
    { id: "m8", name: "ชาไทย", price: 40, categoryId: "c5", available: true, featured: false, updatedAt: now },
    { id: "m9", name: "โค้ก", price: 30, categoryId: "c5", available: true, featured: false, updatedAt: now },
    { id: "m10", name: "ข้าวเปล่า", price: 15, categoryId: "c6", available: true, featured: false, updatedAt: now },
    { id: "m11", name: "ลาบหมู", price: 85, categoryId: "c3", available: true, featured: false, description: "ลาบหมูสดรสจัด", updatedAt: now },
    { id: "m12", name: "ทับทิมกรอบ", price: 55, categoryId: "c7", available: true, featured: true, description: "ทับทิมกรอบในน้ำกะทิเย็น", updatedAt: now },
  ];

  const { error: menuError } = await supabase.from("MenuItem").upsert(menuItems, { onConflict: "id" });
  if (menuError) console.error("MenuItem error:", menuError);
  else console.log("✓ MenuItem seeded");

  // 3. Tables
  const tables = Array.from({ length: 12 }, (_, i) => ({
    id: `t${i + 1}`,
    number: i + 1,
    capacity: [2, 4, 4, 6, 2, 4, 4, 8, 2, 4, 6, 4][i],
    status: "AVAILABLE",
  }));

  const { error: tableError } = await supabase.from("Table").upsert(tables, { onConflict: "id" });
  if (tableError) console.error("Table error:", tableError);
  else console.log("✓ Table seeded");

  // 4. Inventory Items
  const inventory = [
    { id: "i1", name: "กุ้งสด", unit: "กก.", currentStock: 2.5, minStock: 3, costPerUnit: 320, updatedAt: now },
    { id: "i2", name: "ไก่สด", unit: "กก.", currentStock: 8, minStock: 5, costPerUnit: 85, updatedAt: now },
    { id: "i3", name: "น้ำมันพืช", unit: "ลิตร", currentStock: 4, minStock: 2, costPerUnit: 45, updatedAt: now },
    { id: "i4", name: "ข้าวสาร", unit: "กก.", currentStock: 25, minStock: 10, costPerUnit: 35, updatedAt: now },
    { id: "i5", name: "กระเทียม", unit: "กก.", currentStock: 0.8, minStock: 1, costPerUnit: 90, updatedAt: now },
    { id: "i6", name: "พริก", unit: "กก.", currentStock: 1.2, minStock: 1, costPerUnit: 150, updatedAt: now },
    { id: "i7", name: "วุ้นเส้น", unit: "แพ็ก", currentStock: 12, minStock: 5, costPerUnit: 25, updatedAt: now },
    { id: "i8", name: "มะนาว", unit: "กก.", currentStock: 3, minStock: 2, costPerUnit: 60, updatedAt: now },
    { id: "i9", name: "เส้นก๋วยเตี๋ยว", unit: "กก.", currentStock: 5, minStock: 3, costPerUnit: 40, updatedAt: now },
    { id: "i10", name: "น้ำปลา", unit: "ขวด", currentStock: 6, minStock: 3, costPerUnit: 35, updatedAt: now },
    { id: "i11", name: "น้ำตาล", unit: "กก.", currentStock: 4, minStock: 2, costPerUnit: 28, updatedAt: now },
    { id: "i12", name: "ผักชี", unit: "กก.", currentStock: 0.3, minStock: 0.5, costPerUnit: 120, updatedAt: now },
  ];

  const { error: invError } = await supabase.from("InventoryItem").upsert(inventory, { onConflict: "id" });
  if (invError) console.error("InventoryItem error:", invError);
  else console.log("✓ InventoryItem seeded");

  console.log("Done!");
}

seed();
