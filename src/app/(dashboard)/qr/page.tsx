"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Table } from "@/types";
import { fetchTables } from "@/lib/supabase/queries";
import { useI18n } from "@/lib/i18n-context";

export default function QRPage() {
  const { t } = useI18n();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTables()
      .then(setTables)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  function handlePrintAll() {
    if (!printRef.current) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>QR Codes</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px; }
        .card { border: 2px solid #e5e7eb; border-radius: 16px; padding: 16px; text-align: center; break-inside: avoid; }
        .card h3 { margin: 8px 0 4px; font-size: 18px; }
        .card p { margin: 0; font-size: 12px; color: #6b7280; }
        .card svg { margin: 0 auto; }
        .footer { font-size: 10px; color: #9ca3af; margin-top: 8px; }
        @media print {
          .grid { grid-template-columns: repeat(3, 1fr); }
          .card { page-break-inside: avoid; }
        }
      </style></head><body>
      ${printRef.current.innerHTML}
      <script>window.print();</script>
      </body></html>
    `);
    win.document.close();
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full page-bg"><span style={{ color: "var(--text-dim)" }} className="text-sm">{t.common.loading}</span></div>;
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 md:gap-6 page-bg">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 style={{ color: "var(--text-primary)" }} className="text-xl md:text-2xl font-bold">{t.qr.title}</h1>
          <p style={{ color: "var(--text-muted)" }} className="text-xs md:text-sm mt-0.5">{t.qr.subtitle}</p>
        </div>
        <button
          onClick={handlePrintAll}
          style={{ background: "var(--blue-grad)", color: "#fff", boxShadow: "0 2px 12px var(--blue-border)" }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs md:text-sm transition-all hover:translate-y-[-1px]"
        >
          🖨️ {t.qr.printAll}
        </button>
      </div>

      {/* Regular tables */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
        {tables.filter((t) => t.number < 100).map((table) => {
          const url = `${baseUrl}/scan/${table.number}`;
          return (
            <div key={table.id} className="card-glass p-4 flex flex-col items-center gap-3 transition-all hover:translate-y-[-2px]">
              <div style={{ background: "#fff", padding: "8px", borderRadius: "12px" }}>
                <QRCodeSVG value={url} size={120} level="M" />
              </div>
              <div className="text-center">
                <div style={{ color: "var(--text-primary)" }} className="font-bold text-sm">{t.qr.table} {table.number}</div>
                <div style={{ color: "var(--text-dim)" }} className="text-xs">{table.capacity} {t.qr.seats}</div>
              </div>
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)" }} className="text-[10px] hover:underline">{url}</a>
            </div>
          );
        })}
      </div>

      {/* Banquet rooms */}
      {tables.some((t) => t.number >= 100) && (
        <>
          <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-lg animate-fade-in">🏛️ {t.qr.banquetRooms}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
            {tables.filter((t) => t.number >= 100).map((table) => {
              const url = `${baseUrl}/scan/${table.number}`;
              return (
                <div key={table.id} className="card-glass p-4 flex flex-col items-center gap-3 transition-all hover:translate-y-[-2px]" style={{ border: "1.5px solid var(--yellow-border)" }}>
                  <div style={{ background: "#fff", padding: "8px", borderRadius: "12px" }}>
                    <QRCodeSVG value={url} size={120} level="M" />
                  </div>
                  <div className="text-center">
                    <div style={{ color: "var(--text-primary)" }} className="font-bold text-sm">🏛️ R{table.number - 100}</div>
                    <div style={{ color: "var(--text-dim)" }} className="text-xs">{table.capacity} {t.qr.seats}</div>
                  </div>
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)" }} className="text-[10px] hover:underline">{url}</a>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Hidden print version */}
      <div className="hidden">
        <div ref={printRef}>
          <div className="grid">
            {tables.map((table) => {
              const url = `${baseUrl}/scan/${table.number}`;
              return (
                <div key={table.id} className="card">
                  <QRCodeSVG value={url} size={140} level="M" />
                  <h3>{t.qr.table} {table.number}</h3>
                  <p>{table.capacity} {t.qr.seats}</p>
                  <p className="footer">restroflow · {url}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
