"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { OrderProvider } from "@/lib/order-context";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { canAccess, DEFAULT_ROUTE } from "@/lib/permissions";

function RoleGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || !profile) return;
    if (!canAccess(profile.role, pathname)) {
      router.replace(DEFAULT_ROUTE[profile.role]);
    }
  }, [loading, profile, pathname, router]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-full page-bg"
        style={{ color: "var(--text-muted)" }}
      >
        <div className="text-center animate-fade-in">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="text-sm font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (profile && !canAccess(profile.role, pathname)) {
    return null;
  }

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <OrderProvider>
        <div className="flex h-full">
          <Sidebar />
          <main
            className="flex-1 overflow-auto pt-14 lg:pt-0"
            style={{ background: "var(--bg-base)" }}
          >
            <RoleGuard>{children}</RoleGuard>
          </main>
        </div>
      </OrderProvider>
    </AuthProvider>
  );
}
