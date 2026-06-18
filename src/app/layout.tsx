import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Restroflow",
  description: "ระบบจัดการร้านอาหารครบวงจร",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
