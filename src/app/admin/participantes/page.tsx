"use client";

import { useState, useEffect } from "react";
import { Check, X, Search, DollarSign } from "lucide-react";

interface Participant {
  id: string;
  user: { name: string; email: string };
  code: string | null;
  paymentStatus: string;
  amountPaid: number | null;
  totalPoints: number;
  rank: number | null;
}

export default function AdminParticipantesPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/participants");
      if (res.ok) {
        const data = await res.json();
        setParticipants(data);
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatus = async (participantId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/participants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, paymentStatus: status }),
      });
      if (res.ok) {
        fetchParticipants();
      }
    } catch (err) {
      console.error("Error updating payment:", err);
    }
  };

  const filtered = participants.filter(p =>
    p.user.name.toLowerCase().includes(search.toLowerCase()) ||
    p.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Validar Pagos</h1>
          <p className="text-gray-600">Gestiona los pagos de inscripción de los participantes.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar participante..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 font-bold text-gray-900">Participante</th>
                <th className="px-6 py-4 font-bold text-gray-900">Email</th>
                <th className="px-6 py-4 font-bold text-gray-900">Código</th>
                <th className="px-6 py-4 font-bold text-gray-900">Puntos</th>
                <th className="px-6 py-4 font-bold text-gray-900">Estado Pago</th>
                <th className="px-6 py-4 font-bold text-gray-900 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Cargando participantes...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                    {participants.length === 0
                      ? "No hay participantes registrados aún."
                      : "No se encontraron resultados."}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{p.user.name}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.user.email}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                        {p.code || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600">{p.totalPoints}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
                        p.paymentStatus === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : p.paymentStatus === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        <DollarSign className="h-3 w-3" />
                        <span>
                          {p.paymentStatus === "APPROVED" ? "Pagado" :
                           p.paymentStatus === "REJECTED" ? "Rechazado" : "Pendiente"}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.paymentStatus !== "APPROVED" && (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handlePaymentStatus(p.id, "APPROVED")}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            title="Aprobar pago"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          {p.paymentStatus === "PENDING" && (
                            <button
                              onClick={() => handlePaymentStatus(p.id, "REJECTED")}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Rechazar pago"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                      {p.paymentStatus === "APPROVED" && (
                        <span className="text-xs text-green-600 font-medium">✓ Confirmado</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
