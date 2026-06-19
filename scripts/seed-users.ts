import "dotenv/config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const users = [
  { email: "owner@restroflow.com", password: "owner1234", role: "owner", displayName: "เจ้าของร้าน" },
  { email: "front@restroflow.com", password: "front1234", role: "front", displayName: "พนักงานหน้าร้าน" },
  { email: "kitchen@restroflow.com", password: "kitchen1234", role: "kitchen", displayName: "พนักงานครัว" },
  { email: "stock@restroflow.com", password: "stock1234", role: "stock", displayName: "พนักงานสต๊อก" },
];

async function createUser(user: (typeof users)[0]) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { role: user.role, displayName: user.displayName },
    }),
  });

  const data = await res.json();

  if (data.id) {
    console.log(`✅ ${user.displayName} (${user.email}) — สร้างสำเร็จ`);
  } else if (JSON.stringify(data).includes("already") || data.code === "email_exists") {
    console.log(`⚠️  ${user.displayName} (${user.email}) — มีอยู่แล้ว`);
  } else {
    console.log(`❌ ${user.displayName} (${user.email}) — `, data.msg || data.message || JSON.stringify(data));
  }
}

async function main() {
  console.log("\n🍽️  Restroflow — สร้างบัญชีทดสอบ\n");
  for (const user of users) {
    await createUser(user);
  }
  console.log("\n📋 บัญชีทดสอบ:");
  console.log("┌─────────────────────────────┬──────────────────────────┬──────────────┐");
  console.log("│ Role                        │ Email                    │ Password     │");
  console.log("├─────────────────────────────┼──────────────────────────┼──────────────┤");
  console.log("│ 👑 เจ้าของร้าน (owner)       │ owner@restroflow.com     │ owner1234    │");
  console.log("│ 🙋 หน้าร้าน (front)         │ front@restroflow.com     │ front1234    │");
  console.log("│ 👨‍🍳 ครัว (kitchen)            │ kitchen@restroflow.com   │ kitchen1234  │");
  console.log("│ 📦 สต๊อก (stock)             │ stock@restroflow.com     │ stock1234    │");
  console.log("└─────────────────────────────┴──────────────────────────┴──────────────┘");
  console.log("");
}

main();
