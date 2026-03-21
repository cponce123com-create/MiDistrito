"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Trophy, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Polla Deportiva</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/ranking" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Ranking
            </Link>
            <Link href="/pronosticos-publicos" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Transparencia
            </Link>
            <Link href="/reglas" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Reglas
            </Link>

            {session ? (
              <>
                <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Mi Panel
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-red-600 font-semibold px-3 py-2 rounded-md text-sm">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-gray-500 hover:text-gray-700 p-2"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Entrar
                </Link>
                <Link href="/registro" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Participar
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-2 pt-2 pb-3 space-y-1">
          <Link href="/ranking" className="block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
            Ranking
          </Link>
          <Link href="/pronosticos-publicos" className="block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
            Transparencia
          </Link>
          <Link href="/reglas" className="block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
            Reglas
          </Link>
          {session ? (
            <>
              <Link href="/dashboard" className="block bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium">
                Mi Panel
              </Link>
              {isAdmin && (
                <Link href="/admin" className="block text-red-600 px-3 py-2 rounded-md text-base font-medium">
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="w-full text-left text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
                Entrar
              </Link>
              <Link href="/registro" className="block bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium">
                Participar
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
