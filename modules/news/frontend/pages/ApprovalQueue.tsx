import { useEffect, useState } from "react";
import { useDistrict } from "../../../../apps/web/src/core/DistrictContext";

export default function ApprovalQueue() {
  const { currentDistrictId } = useDistrict();
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    if (!currentDistrictId) return;
    fetch(`/api/news/approval?districtId=${currentDistrictId}`, { credentials: "include" })
      .then((r) => r.json())
      .then(setPending)
      .catch(() => {});
  }, [currentDistrictId]);

  const handleApprove = async (id: number) => {
    await fetch(`/api/news/approval/${id}/approve`, { method: "POST", credentials: "include" });
    setPending((prev) => prev.filter((a: any) => a.id !== id));
  };

  const handleReject = async (id: number) => {
    await fetch(`/api/news/approval/${id}/reject`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Rechazado por el editor" }),
    });
    setPending((prev) => prev.filter((a: any) => a.id !== id));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cola de aprobación</h1>
      {pending.length === 0 ? (
        <p className="text-gray-400">No hay artículos pendientes.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((a: any) => (
            <div key={a.id} className="p-3 bg-gray-800 rounded">
              <h2 className="font-semibold">{a.title}</h2>
              <p className="text-sm text-gray-400 mt-1">{a.summary?.slice(0, 100)}...</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleApprove(a.id)} className="px-3 py-1 bg-green-600 rounded text-sm">Aprobar</button>
                <button onClick={() => handleReject(a.id)} className="px-3 py-1 bg-red-600 rounded text-sm">Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
