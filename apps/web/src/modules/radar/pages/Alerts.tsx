export default function Alerts() {
  const alerts = [
    { id: 1, title: "Robo en vivienda", location: "Av. Los Olivos 245", time: "Hace 5 min" },
    { id: 2, title: "Persona sospechosa", location: "Jr. Las Flores 102", time: "Hace 18 min" },
    { id: 3, title: "Accidente de tránsito", location: "Cruce Av. Central y 28 de Julio", time: "Hace 32 min" },
  ];

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 20, margin: "0 0 18px 0", color: "var(--md-text)" }}>
        Alertas activas
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {alerts.map((a) => (
          <div key={a.id} className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#FDECEC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "var(--md-danger)",
                  fontSize: 18,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--md-text)" }}>{a.title}</span>
                  <span className="chip chip-alerta" style={{ fontSize: 11, padding: "3px 8px" }}>Alerta</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--md-muted)" }}>{a.location}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--md-muted)" }}>{a.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
