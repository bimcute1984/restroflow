"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/permissions";
import type { UserRole } from "@/types";

const ROLES: UserRole[] = ["owner", "front", "kitchen", "stock"];

export default function StaffPage() {
  const { profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("front");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const supabase = createClient();

  if (profile?.role !== "owner") {
    return (
      <div className="p-6 page-bg flex items-center justify-center h-full">
        <p style={{ color: "var(--text-muted)" }} className="text-sm">
          ไม่มีสิทธิ์เข้าถึงหน้านี้
        </p>
      </div>
    );
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, displayName },
    });

    if (error) {
      if (error.message.includes("not authorized") || error.message.includes("not allowed")) {
        setMessage({
          type: "error",
          text: "ไม่สามารถสร้างผู้ใช้จาก client ได้ กรุณาสร้างผ่าน Supabase Dashboard แทน (Authentication → Users → Add User) แล้วตั้ง user_metadata: { \"role\": \"" + role + "\", \"displayName\": \"" + displayName + "\" }",
        });
      } else {
        setMessage({ type: "error", text: error.message });
      }
    } else {
      setMessage({ type: "success", text: `สร้างบัญชี ${email} สำเร็จ!` });
      setEmail("");
      setPassword("");
      setDisplayName("");
    }
    setLoading(false);
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 md:gap-6 page-bg">
      <div className="animate-fade-in">
        <h1 style={{ color: "var(--text-primary)" }} className="text-xl md:text-2xl font-bold">
          จัดการทีมงาน
        </h1>
        <p style={{ color: "var(--text-muted)" }} className="text-xs md:text-sm mt-0.5">
          Staff Management
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
        {ROLES.map((r) => {
          const c = ROLE_COLORS[r];
          return (
            <div key={r} className="stat-card p-4">
              <div className="glow" style={{ background: `var(${c.color})` }} />
              <div className="relative z-10">
                <div
                  style={{
                    background: `var(${c.bg})`,
                    color: `var(${c.color})`,
                    border: `1px solid var(${c.border})`,
                  }}
                  className="text-xs px-2.5 py-1 rounded-full font-semibold inline-block"
                >
                  {ROLE_LABELS[r]}
                </div>
                <div style={{ color: "var(--text-dim)" }} className="text-[10px] mt-2">
                  {r === "owner" && "เห็นทุกหน้า จัดการทีม"}
                  {r === "front" && "คิว, โต๊ะ, สั่งอาหาร"}
                  {r === "kitchen" && "รับออเดอร์, เปลี่ยนสถานะ"}
                  {r === "stock" && "จัดการสต๊อกวัตถุดิบ"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-glass p-5 md:p-6 max-w-lg animate-fade-in">
        <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base mb-4">
          เพิ่มพนักงานใหม่
        </h2>

        {message && (
          <div
            style={
              message.type === "success"
                ? { background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green)" }
                : { background: "var(--red-bg)", border: "1px solid var(--red-border)", color: "var(--red)" }
            }
            className="px-4 py-3 rounded-xl text-xs font-medium mb-4 leading-relaxed"
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">
              ชื่อที่แสดง
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="เช่น สมชาย"
              required
              className="input-styled w-full py-2.5"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@example.com"
              required
              className="input-styled w-full py-2.5"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัว"
              required
              minLength={6}
              className="input-styled w-full py-2.5"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">
              บทบาท
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => {
                const c = ROLE_COLORS[r];
                const selected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={
                      selected
                        ? { background: `var(${c.bg})`, color: `var(${c.color})`, border: `1.5px solid var(${c.border})` }
                        : { background: "var(--bg-deep)", color: "var(--text-muted)", border: "1.5px solid var(--border)" }
                    }
                    className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    {ROLE_LABELS[r]}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password || !displayName}
            style={
              !loading && email && password && displayName
                ? { background: "var(--purple-grad)", color: "#fff", boxShadow: "0 2px 12px var(--purple-border)" }
                : { background: "var(--border)", color: "var(--text-dim)" }
            }
            className="w-full py-3 rounded-xl font-bold text-sm transition-all mt-1"
          >
            {loading ? "กำลังสร้าง..." : "เพิ่มพนักงาน"}
          </button>
        </form>

        <div
          style={{ borderTop: "1px solid var(--border)" }}
          className="mt-5 pt-4"
        >
          <p style={{ color: "var(--text-dim)" }} className="text-[10px] leading-relaxed">
            หมายเหตุ: หากสร้างจากหน้านี้ไม่ได้ ให้ไปที่ Supabase Dashboard → Authentication → Users → Add User แล้วเพิ่ม user_metadata เป็น {`{ "role": "front", "displayName": "ชื่อ" }`}
          </p>
        </div>
      </div>
    </div>
  );
}
