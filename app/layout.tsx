import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Koperasi Sumber Makmur",
  description: "Katalog koperasi berbasis Next.js dan MariaDB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <div className="paper surface-grid">
          <header className="nav">
            <div className="container nav-inner">
              <Link href="/" className="brand">
                <span className="brand-mark">SM</span>
                <span>Koperasi Sumber Makmur</span>
              </Link>

              <nav className="nav-links">
                <Link href="/">Beranda</Link>
                <Link href="/catalog">Katalog</Link>
                <Link href="/admin">Admin</Link>
              </nav>
            </div>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
