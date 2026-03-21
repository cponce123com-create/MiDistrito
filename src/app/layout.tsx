import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polla Deportiva - Quiniela Mundial y Libertadores",
  description: "Plataforma de quinielas deportivas para competir con tus amigos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <footer className="bg-white border-t border-gray-200 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Polla Deportiva. Todos los derechos reservados.
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
