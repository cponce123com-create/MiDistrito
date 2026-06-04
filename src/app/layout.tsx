import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Polla Mundial 2026",
  description: "Quiniela del Mundial 2026 - Pronostica y gana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-white border-t py-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Polla Mundial 2026
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
