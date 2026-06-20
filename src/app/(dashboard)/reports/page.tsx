"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useOrders } from "@/lib/order-context";
import { useI18n } from "@/lib/i18n-context";
import {
  fetchDailySales, fetchTopMenuItems, fetchHourlySales, fetchOrderHistory,
  type DailySalesRow, type TopMenuRow, type HourlySalesRow,
} from "@/lib/supabase/queries";
import type { Order } from "@/types";

function StatCard({ label, value, sub, colorVar, icon }: { label: string; value: string | number; sub?: string; colorVar: string; icon: string }) {
  return (
    <div className="stat-card p-4 md:p-5">
      <div className="glow" style={{ background: `var(${colorVar})` }} />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div style={{ color: "var(--text-muted)" }} className="text-xs mb-1.5">{label}</div>
          <div style={{ color: `var(${colorVar})` }} className="text-xl md:text-2xl font-bold">{value}</div>
          {sub && <div style={{ color: "var(--text-dim)" }} className="text-xs mt-1">{sub}</div>}
        </div>
        <span className="text-2xl opacity-60">{icon}</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="modal-content px-3 py-2 text-sm">
      <p style={{ color: "var(--text-muted)" }} className="text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {typeof p.value === "number" && p.value > 100 ? `฿${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

type RangeDays = 7 | 14 | 30;

export default function ReportsPage() {
  const { todayRevenue, todayOrderCount } = useOrders();
  const { t } = useI18n();
  const [range, setRange] = useState<RangeDays>(7);
  const [dailySales, setDailySales] = useState<DailySalesRow[]>([]);
  const [topMenus, setTopMenus] = useState<TopMenuRow[]>([]);
  const [hourly, setHourly] = useState<HourlySalesRow[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDailySales(range),
      fetchTopMenuItems(range),
      fetchHourlySales(range),
      fetchOrderHistory(50),
    ])
      .then(([ds, tm, hs, hist]) => {
        setDailySales(ds);
        setTopMenus(tm);
        setHourly(hs);
        setHistory(hist);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  const pastDays = dailySales.slice(0, -1);
  const yesterday = pastDays[pastDays.length - 1];
  const weekRevenue = pastDays.reduce((s, d) => s + d.revenue, 0) + todayRevenue;
  const weekOrders = pastDays.reduce((s, d) => s + d.orders, 0) + todayOrderCount;
  const revenueChange = yesterday && yesterday.revenue > 0
    ? (((todayRevenue - yesterday.revenue) / yesterday.revenue) * 100).toFixed(1)
    : "0";
  const peakHour = hourly.length > 0
    ? hourly.reduce((a, b) => (a.orders > b.orders ? a : b))
    : { hour: 0, orders: 0 };
  const avgPerOrder = todayOrderCount > 0 ? Math.round(todayRevenue / todayOrderCount) : 0;

  const dailyChartData = [
    ...pastDays.map((d) => ({ date: d.date.slice(5), revenue: d.revenue, orders: d.orders })),
    { date: t.reports.today, revenue: todayRevenue, orders: todayOrderCount },
  ];
  const hourlyData = hourly.map((h) => ({ hour: `${h.hour}:00`, orders: h.orders }));

  function exportCSV() {
    const header = "Date,Revenue,Orders,AvgPerOrder\n";
    const rows = dailySales.map((d) => `${d.date},${d.revenue},${d.orders},${d.avgPerOrder}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `restroflow-report-${range}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const rangeOptions: { days: RangeDays; label: string }[] = [
    { days: 7, label: t.reports.range7 },
    { days: 14, label: t.reports.range14 },
    { days: 30, label: t.reports.range30 },
  ];

  const visibleHistory = showAllHistory ? history : history.slice(0, 5);

  if (loading) {
    return <div className="flex items-center justify-center h-full page-bg"><span style={{ color: "var(--text-dim)" }} className="text-sm">{t.common.loading}</span></div>;
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 md:gap-6 page-bg">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 style={{ color: "var(--text-primary)" }} className="text-xl md:text-2xl font-bold">{t.reports.title}</h1>
          <p style={{ color: "var(--text-muted)" }} className="text-xs md:text-sm mt-0.5">{t.reports.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {rangeOptions.map((r) => (
              <button
                key={r.days}
                onClick={() => setRange(r.days)}
                style={range === r.days
                  ? { background: "var(--blue-bg)", color: "var(--blue)", border: "1px solid var(--blue-border)" }
                  : { color: "var(--text-muted)", border: "1px solid var(--border)" }}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={exportCSV}
            style={{ background: "var(--green-grad)", color: "#fff", boxShadow: "0 2px 12px var(--green-border)" }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs md:text-sm transition-all hover:translate-y-[-1px]"
          >
            ⬇ {t.reports.export}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
        <StatCard icon="💰" label={t.reports.todaySales} value={`฿${todayRevenue.toLocaleString()}`} sub={`${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}% ${t.reports.fromYesterday}`} colorVar="--green" />
        <StatCard icon="📋" label={t.reports.todayOrders} value={todayOrderCount} sub={t.reports.avgPerOrder.replace("{n}", String(avgPerOrder))} colorVar="--blue" />
        <StatCard icon="📈" label={t.reports.weekSales} value={`฿${weekRevenue.toLocaleString()}`} sub={`${weekOrders} ${t.reports.orders}`} colorVar="--yellow" />
        <StatCard icon="⏰" label={t.reports.peakHours} value={peakHour.orders > 0 ? `${peakHour.hour}:00` : "-"} sub={peakHour.orders > 0 ? `${peakHour.orders} ${t.reports.orders}` : t.reports.noData} colorVar="--purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
        <div className="card-glass lg:col-span-2 p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">📊 {t.reports.salesChart}</h2>
            <span style={{ color: "var(--text-dim)" }} className="text-xs">{t.common.baht}</span>
          </div>
          {dailyChartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyChartData}>
                <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} /><stop offset="95%" stopColor="#16a34a" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="date" stroke="var(--chart-axis)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--chart-axis)" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="var(--green)" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px]"><span style={{ color: "var(--text-dim)" }} className="text-sm">{t.reports.noData}</span></div>
          )}
        </div>
        <div className="card-glass p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">📦 {t.reports.ordersChart}</h2>
            <span style={{ color: "var(--text-dim)" }} className="text-xs">{t.reports.sevenDays}</span>
          </div>
          {dailyChartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="date" stroke="var(--chart-axis)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--chart-axis)" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" fill="var(--blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px]"><span style={{ color: "var(--text-dim)" }} className="text-sm">{t.reports.noData}</span></div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
        <div className="card-glass p-4 md:p-5">
          <h2 style={{ color: "var(--text-primary)" }} className="font-semibold text-sm mb-4">🏆 {t.reports.topMenus}</h2>
          {topMenus.length > 0 ? (
            <div className="flex flex-col gap-3">
              {topMenus.map((item, i) => {
                const pct = topMenus[0].totalQty > 0 ? (item.totalQty / topMenus[0].totalQty) * 100 : 0;
                return (
                  <div key={item.menuItemId} className="flex items-center gap-3">
                    <span style={{ color: i === 0 ? "var(--yellow)" : "var(--text-dim)" }} className="text-sm font-bold w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span style={{ color: "var(--text-primary)" }} className="text-xs font-medium truncate">{item.name}</span>
                        <span style={{ color: "var(--text-muted)" }} className="text-xs shrink-0 ml-2">{item.totalQty} {t.reports.plates}</span>
                      </div>
                      <div style={{ background: "var(--border)" }} className="h-1.5 rounded-full overflow-hidden">
                        <div style={{ width: `${pct}%`, background: i === 0 ? "var(--yellow-grad)" : "var(--blue-grad)" }} className="h-full rounded-full transition-all" />
                      </div>
                    </div>
                    <span style={{ color: "var(--green)" }} className="text-xs font-semibold shrink-0 w-16 text-right">฿{item.totalRevenue.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[120px]"><span style={{ color: "var(--text-dim)" }} className="text-sm">{t.reports.noData}</span></div>
          )}
        </div>
        <div className="card-glass p-4 md:p-5">
          <h2 style={{ color: "var(--text-primary)" }} className="font-semibold text-sm mb-4">⏰ {t.reports.busyHours}</h2>
          {hourly.some((h) => h.orders > 0) ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="hour" stroke="var(--chart-axis)" tick={{ fontSize: 10 }} />
                <YAxis stroke="var(--chart-axis)" tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" fill="var(--purple)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[180px]"><span style={{ color: "var(--text-dim)" }} className="text-sm">{t.reports.noData}</span></div>
          )}
        </div>
      </div>

      {/* Order History */}
      <div className="card-glass p-4 md:p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">📜 {t.reports.history}</h2>
            <p style={{ color: "var(--text-dim)" }} className="text-xs mt-0.5">{t.reports.historySubtitle}</p>
          </div>
          {history.length > 5 && (
            <button
              onClick={() => setShowAllHistory(!showAllHistory)}
              style={{ color: "var(--blue)" }}
              className="text-xs font-semibold hover:underline"
            >
              {showAllHistory ? t.common.close : t.reports.viewAll} ({history.length})
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <div style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-deep)", color: "var(--text-muted)" }} className="grid grid-cols-12 px-4 py-2.5 text-xs font-semibold rounded-t-xl">
                <div className="col-span-2">{t.reports.orderNumber}</div>
                <div className="col-span-3">{t.reports.date}</div>
                <div className="col-span-3">{t.reports.items}</div>
                <div className="col-span-2 text-right">{t.reports.amount}</div>
                <div className="col-span-2 text-right">{t.reports.status}</div>
              </div>
              {visibleHistory.map((order, idx) => (
                <div
                  key={order.id}
                  style={{ borderBottom: idx < visibleHistory.length - 1 ? "1px solid var(--border)" : undefined }}
                  className="grid grid-cols-12 px-4 py-3 items-center transition-colors hover:bg-[var(--bg-hover)]"
                >
                  <div className="col-span-2">
                    <span style={{ color: "var(--text-primary)" }} className="text-xs font-mono">{order.id.substring(0, 10)}</span>
                  </div>
                  <div className="col-span-3">
                    <span style={{ color: "var(--text-secondary)" }} className="text-xs">
                      {order.createdAt.toLocaleDateString("th-TH")} {order.createdAt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span style={{ color: "var(--text-muted)" }} className="text-xs truncate block">
                      {order.items.map((i) => i.menuItem.name).join(", ")}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span style={{ color: "var(--green)" }} className="text-xs font-semibold">฿{order.total.toLocaleString()}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span
                      style={order.status === "completed"
                        ? { background: "var(--green-bg)", color: "var(--green)", border: "1px solid var(--green-border)" }
                        : { background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-border)" }}
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    >
                      {order.status === "completed" ? t.reports.completed : t.reports.cancelled}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-2">
              {visibleHistory.map((order) => (
                <div
                  key={order.id}
                  style={{ background: "var(--bg-deep)", border: "1px solid var(--border)" }}
                  className="rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ color: "var(--text-primary)" }} className="text-xs font-mono">{order.id.substring(0, 10)}</span>
                    <span
                      style={order.status === "completed"
                        ? { background: "var(--green-bg)", color: "var(--green)", border: "1px solid var(--green-border)" }
                        : { background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-border)" }}
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    >
                      {order.status === "completed" ? t.reports.completed : t.reports.cancelled}
                    </span>
                  </div>
                  <div style={{ color: "var(--text-muted)" }} className="text-[10px] mb-1">
                    {order.createdAt.toLocaleDateString("th-TH")} {order.createdAt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div style={{ color: "var(--text-dim)" }} className="text-[10px] truncate mb-1.5">
                    {order.items.map((i) => i.menuItem.name).join(", ")}
                  </div>
                  <div style={{ color: "var(--green)" }} className="text-sm font-bold">฿{order.total.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[100px]">
            <span style={{ color: "var(--text-dim)" }} className="text-sm">{t.reports.noData}</span>
          </div>
        )}
      </div>
    </div>
  );
}
