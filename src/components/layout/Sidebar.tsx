"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { getAllowedRoutes, ROLE_COLORS } from "@/lib/permissions";
import { LOCALE_FLAGS, type Locale } from "@/lib/i18n/translations";

const allNavItems = [
  { href: "/orders", icon: "🍽️", key: "orders" as const, colorVar: "--blue", bgVar: "--blue-bg", borderVar: "--blue-border" },
  { href: "/queue", icon: "🪑", key: "queue" as const, colorVar: "--yellow", bgVar: "--yellow-bg", borderVar: "--yellow-border" },
  { href: "/inventory", icon: "📦", key: "inventory" as const, colorVar: "--cyan", bgVar: "--cyan-bg", borderVar: "--cyan-border" },
  { href: "/menu", icon: "📋", key: "menu" as const, colorVar: "--red", bgVar: "--red-bg", borderVar: "--red-border" },
  { href: "/reports", icon: "📊", key: "reports" as const, colorVar: "--green", bgVar: "--green-bg", borderVar: "--green-border" },
  { href: "/staff", icon: "👥", key: "staff" as const, colorVar: "--purple", bgVar: "--purple-bg", borderVar: "--purple-border" },
  { href: "/qr", icon: "📱", key: "qr" as const, colorVar: "--green", bgVar: "--green-bg", borderVar: "--green-border" },
];

const locales: Locale[] = ["th", "en", "ja", "ko"];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { profile, signOut } = useAuth();
  const { locale, setLocale, t } = useI18n();

  const allowedRoutes = profile ? getAllowedRoutes(profile.role) : [];
  const navItems = allNavItems.filter((item) => allowedRoutes.includes(item.href));

  const roleColors = profile ? ROLE_COLORS[profile.role] : null;

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  const langSwitcher = (
    <div className="flex gap-1">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          style={locale === l ? { background: "var(--blue-bg)", border: "1px solid var(--blue-border)" } : { background: "var(--bg-deep)", border: "1px solid var(--border)" }}
          className="flex-1 py-1.5 rounded-lg text-sm transition-all"
          title={l}
        >
          {LOCALE_FLAGS[l]}
        </button>
      ))}
    </div>
  );

  const userInfo = profile && roleColors && (
    <div className="flex flex-col gap-2">
      <div
        style={{ background: "var(--bg-deep)", border: "1px solid var(--border)" }}
        className="rounded-xl p-3 flex flex-col gap-1.5"
      >
        <div className="flex items-center justify-between">
          <span style={{ color: "var(--text-primary)" }} className="text-xs font-semibold truncate">
            {profile.displayName}
          </span>
          <span
            style={{
              background: `var(${roleColors.bg})`,
              color: `var(${roleColors.color})`,
              border: `1px solid var(${roleColors.border})`,
            }}
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
          >
            {t.roles[profile.role]}
          </span>
        </div>
        <span style={{ color: "var(--text-dim)" }} className="text-[10px] truncate">
          {profile.email}
        </span>
      </div>
      <button
        onClick={handleLogout}
        style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-border)" }}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110 w-full"
      >
        {t.sidebar.logout}
      </button>
    </div>
  );

  const themeToggle = (
    <button
      onClick={toggle}
      style={{ background: "var(--bg-deep)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:brightness-110 w-full"
    >
      <span className="text-base">{theme === "dark" ? "🌙" : "☀️"}</span>
      <span>{theme === "dark" ? t.sidebar.darkMode : t.sidebar.lightMode}</span>
    </button>
  );

  const nav = (
    <>
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={
              active
                ? { background: `var(${item.bgVar})`, color: `var(${item.colorVar})`, boxShadow: `0 0 20px var(${item.borderVar})` }
                : { color: "var(--text-muted)" }
            }
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-[var(--bg-hover)]"
          >
            <span className="text-xl shrink-0">{item.icon}</span>
            <span className="text-sm font-medium">{t.nav[item.key]}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center h-14 px-4 gap-3"
        style={{ background: `linear-gradient(180deg, var(--bg-base) 0%, var(--bg-base) 80%, transparent 100%)` }}
      >
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 7h18M3 12h18M3 17h18" />
          </svg>
        </button>
        <span style={{ color: "var(--text-primary)" }} className="font-bold text-base">
          restro<span style={{ color: "var(--blue)" }}>flow</span>
        </span>
        <button
          onClick={toggle}
          className="ml-auto text-lg"
          style={{ color: "var(--text-muted)" }}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 modal-overlay" onClick={() => setOpen(false)}>
          <aside
            className="w-64 h-full flex flex-col animate-slide-in"
            style={{ background: `linear-gradient(180deg, var(--bg-sidebar-start), var(--bg-sidebar-end))`, borderRight: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-14 flex items-center justify-between px-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-primary)" }} className="font-bold text-lg">
                restro<span style={{ color: "var(--blue)" }}>flow</span>
              </span>
              <button onClick={() => setOpen(false)} style={{ color: "var(--text-dim)" }} className="text-lg font-bold">✕</button>
            </div>
            <nav className="flex-1 py-4 flex flex-col gap-1 px-3">{nav}</nav>
            <div className="px-3 pb-2">{langSwitcher}</div>
            <div className="px-3 pb-2">{themeToggle}</div>
            <div className="px-3 pb-3">{userInfo}</div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col h-full w-60 shrink-0"
        style={{ background: `linear-gradient(180deg, var(--bg-sidebar-start), var(--bg-sidebar-end))`, borderRight: "1px solid var(--border)" }}
      >
        <div className="h-14 flex items-center px-5 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <span style={{ color: "var(--text-primary)" }} className="font-bold text-lg">
            restro<span style={{ color: "var(--blue)" }}>flow</span>
          </span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">{nav}</nav>
        <div className="px-3 pb-2">{langSwitcher}</div>
        <div className="px-3 pb-2">{themeToggle}</div>
        <div className="px-3 pb-3">{userInfo}</div>
      </aside>
    </>
  );
}
