"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/orders",
    icon: "🍽️",
    label: "สั่งอาหาร",
    color: "#61afef",
    bg: "#1e2d4a",
  },
  {
    href: "/queue",
    icon: "🪑",
    label: "คิว & โต๊ะ",
    color: "#e5c07b",
    bg: "#2a2010",
  },
  {
    href: "/inventory",
    icon: "📦",
    label: "สต๊อก",
    color: "#56b6c2",
    bg: "#1a2a2a",
  },
  {
    href: "/menu",
    icon: "📋",
    label: "เมนู",
    color: "#e06c75",
    bg: "#2a1a1a",
  },
  {
    href: "/reports",
    icon: "📊",
    label: "รายงาน",
    color: "#98c379",
    bg: "#1e2a1e",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ background: "#1a1d27", borderRight: "1px solid #2d3141" }}
      className="w-16 md:w-56 flex flex-col h-full shrink-0"
    >
      {/* Logo */}
      <div
        style={{ borderBottom: "1px solid #2d3141" }}
        className="h-14 flex items-center px-4 shrink-0"
      >
        <span className="text-white font-bold text-lg hidden md:block">
          restro<span style={{ color: "#61afef" }}>flow</span>
        </span>
        <span className="text-white font-bold text-lg md:hidden">R</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={
                active
                  ? { background: item.bg, color: item.color }
                  : { color: "#636d83" }
              }
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:text-white"
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              <span className="hidden md:block text-sm font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{ borderTop: "1px solid #2d3141", color: "#636d83" }}
        className="p-4 text-xs hidden md:block"
      >
        ร้านอาหาร · v1.0
      </div>
    </aside>
  );
}
