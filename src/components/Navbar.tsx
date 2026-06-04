"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Trophy, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Trophy className="h-7 w-7 text-yellow-500" />
          <span className="text-lg font-bold">Polla 2026</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/ranking" className="text-sm text-gray-600 hover:text-blue-600">Ranking</Link>
          <Link href="/partidos" className="text-sm text-gray-600 hover:text-blue-600">Partidos</Link>
          <Link href="/reglas" className="text-sm text-gray-600 hover:text-blue-600">Reglas</Link>

          {session ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="text-sm text-red-600 font-semibold hover:text-red-700">Admin</Link>
              )}
              <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Mi Panel
              </Link>
              <Link href="/pronosticos" className="text-sm text-gray-600 hover:text-blue-600">Pronosticar</Link>
              <button onClick={() => signOut()} className="p-2 text-gray-400 hover:text-gray-600">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600">Entrar</Link>
              <Link href="/registro" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Participar
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t bg-white p-4 space-y-2">
          <Link href="/ranking" className="block py-2 text-sm" onClick={() => setIsOpen(false)}>Ranking</Link>
          <Link href="/partidos" className="block py-2 text-sm" onClick={() => setIsOpen(false)}>Partidos</Link>
          <Link href="/reglas" className="block py-2 text-sm" onClick={() => setIsOpen(false)}>Reglas</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="block py-2 text-sm font-medium" onClick={() => setIsOpen(false)}>Mi Panel</Link>
              <Link href="/pronosticos" className="block py-2 text-sm" onClick={() => setIsOpen(false)}>Pronosticar</Link>
              {isAdmin && <Link href="/admin" className="block py-2 text-sm text-red-600" onClick={() => setIsOpen(false)}>Admin</Link>}
              <button onClick={() => { signOut(); setIsOpen(false); }} className="block py-2 text-sm text-gray-500">Cerrar Sesión</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-sm" onClick={() => setIsOpen(false)}>Entrar</Link>
              <Link href="/registro" className="block py-2 text-sm font-medium text-blue-600" onClick={() => setIsOpen(false)}>Participar</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
