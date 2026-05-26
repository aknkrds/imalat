import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "İmalat Takip - Tekstil Üretim Yönetim Sistemi",
  description: "Tekstil üretim süreçlerini uçtan uca yöneten akıllı üretim takip ve operasyon yönetim sistemi",
  keywords: "tekstil, üretim, takip, sipariş, maliyet, kesim, dikim",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
