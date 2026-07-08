import { useParams } from "react-router-dom";

export default function ReportDetail() {
  const { id } = useParams();

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 20, margin: "0 0 18px 0", color: "var(--md-text)" }}>
        Reporte #{id}
      </h2>

      <div className="card" style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--md-text)" }}>Bache en la Av. Principal</span>
          <span className="chip chip-precaución">En proceso</span>
        </div>

        <div style={{ marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--md-muted)", lineHeight: 1.6 }}>
            Se reporta un bache de gran tamaño en la intersección de la Av. Principal con Jr. Las Flores,
            causando riesgo para vehículos y peatones.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--md-muted)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Av. Principal 456, San Martín de Porres
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--md-muted)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            15/03/2025 — 10:30 am
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-primary" style={{ flex: 1 }}>
            Editar
          </button>
          <button className="btn-secondary" style={{ flex: 1 }}>
            Compartir
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "var(--md-text)" }}>
          Historial de estados
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--md-muted)" }}>
            <span className="chip chip-resuelto" style={{ fontSize: 11, padding: "3px 8px" }}>Resuelto</span>
            <span>16/03/2025</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--md-muted)" }}>
            <span className="chip chip-precaución" style={{ fontSize: 11, padding: "3px 8px" }}>En proceso</span>
            <span>15/03/2025</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--md-muted)" }}>
            <span className="chip chip-robo" style={{ fontSize: 11, padding: "3px 8px" }}>Reportado</span>
            <span>15/03/2025</span>
          </div>
        </div>
      </div>
    </div>
  );
}
