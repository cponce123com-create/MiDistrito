import { useEffect, useState } from "react";
import { useDistrict } from "../../../core/DistrictContext";

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
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 20, margin: "0 0 18px 0", color: "var(--md-text)" }}>
        Cola de aprobación
      </h2>
      {pending.length === 0 ? (
        <p style={{ color: "var(--md-muted)", fontSize: 14 }}>No hay artículos pendientes.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pending.map((a: any) => (
            <div key={a.id} className="card" style={{ padding: 14 }}>
              <h3 style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 14, color: "var(--md-text)" }}>
                {a.title}
              </h3>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--md-muted)" }}>
                {a.summary?.slice(0, 100)}...
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => handleApprove(a.id)} className="btn-primary" style={{ flex: 1, fontSize: 13 }}>
                  Aprobar
                </button>
                <button onClick={() => handleReject(a.id)} className="btn-danger" style={{ flex: 1, fontSize: 13 }}>
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
