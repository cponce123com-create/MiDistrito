import { useEffect, useState } from "react";
import { useAuth } from "../../../core/AuthContext";
import { useDistrict } from "../../../core/DistrictContext";

export default function Sources() {
  const { user } = useAuth();
  const { currentDistrictId } = useDistrict();
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    if (!currentDistrictId) return;
    fetch(`/api/news/sources?districtId=${currentDistrictId}`, { credentials: "include" })
      .then((r) => r.json())
      .then(setSources)
      .catch(() => {});
  }, [currentDistrictId]);

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 20, margin: "0 0 18px 0", color: "var(--md-text)" }}>
        Fuentes de noticias
      </h2>
      {sources.length === 0 ? (
        <p style={{ color: "var(--md-muted)", fontSize: 14 }}>No hay fuentes configuradas.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sources.map((s: any) => (
            <div key={s.id} className="card" style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: "var(--md-text)" }}>{s.name}</span>
                <span className="chip chip-info" style={{ fontSize: 11, padding: "3px 8px" }}>{s.sourceType}</span>
              </div>
              <span
                className={s.isActive ? "chip chip-resuelto" : "chip chip-alerta"}
                style={{ fontSize: 11, padding: "3px 8px" }}
              >
                {s.isActive ? "Activa" : "Inactiva"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
