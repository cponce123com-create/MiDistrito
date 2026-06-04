"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminSeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const seed = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      setResult({ ok: res.ok, message: data.message || (res.ok ? "Datos cargados" : "Error") });
    } catch {
      setResult({ ok: false, message: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Seed Data - Mundial 2026</h1>
      <p className="text-gray-500 mb-8">Carga los datos iniciales del Mundial 2026: torneo, equipos, grupos y partidos.</p>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="font-bold text-lg mb-2">¿Qué se cargará?</h2>
        <ul className="text-sm text-gray-600 space-y-1 mb-6">
          <li>• Torneo "Mundial 2026"</li>
          <li>• 48 equipos clasificados (12 grupos de 4)</li>
          <li>• 48 partidos de fase de grupos</li>
          <li>• 16avos, octavos, cuartos, semis y final (placeholders)</li>
        </ul>

        <button
          onClick={seed}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? "Cargando..." : "Cargar Datos Iniciales"}
        </button>

        {result && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
            result.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {result.ok ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}
