import { useDistrict } from "../../../../apps/web/src/core/DistrictContext";
import { useNavigate } from "react-router-dom";

/* ---------- SVG Icons ---------- */
const Icons = {
  alert: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  ),
  pin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.8 10A10 10 0 1 1 17 3.3" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  ),
  plus: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8v8" /><path d="M8 12h8" /><circle cx="12" cy="12" r="10" />
    </svg>
  ),
  users: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="8" r="4" />
      <path d="M19 21a7 7 0 0 0-14 0" />
      <path d="m17 8 4 2" /><path d="m21 8-4 2" />
    </svg>
  ),
  news: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18h-5" /><path d="M18 14h-8" /><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    </svg>
  ),
  store: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 7 4.4-4.4A2 2 0 0 1 7.8 2h8.4a2 2 0 0 1 1.4.6L22 7" />
      <path d="M2 7h20v3a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" />
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
    </svg>
  ),
  lock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

export default function Home() {
  const navigate = useNavigate();
  const { currentDistrict } = useDistrict();

  return (
    <div>
      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: "#FEF4E6" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" /><path d="M12 17h.01" />
            </svg>
          </div>
          <div className="metric-value">3</div>
          <div className="metric-label">Alertas activas</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: "var(--md-primary-50)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--md-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="metric-value">28</div>
          <div className="metric-label">Reportes esta semana</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: "#E9F6EE" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.8 10A10 10 0 1 1 17 3.3" />
              <path d="m9 11 3 3L22 4" />
            </svg>
          </div>
          <div className="metric-value">19</div>
          <div className="metric-label">Reportes resueltos</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--md-text)", marginBottom: 12 }}>
          Acciones rápidas
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Reportar incidencia */}
          <button
            className="quick-action"
            style={{ background: "var(--md-primary)", color: "#fff", border: "none" }}
            onClick={() => navigate("/reportar")}
          >
            <div className="qa-icon" style={{ background: "rgba(255,255,255,0.2)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v8" /><path d="M8 12h8" /><circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <span className="qa-label">Reportar incidencia</span>
          </button>

          {/* Personas desaparecidas */}
          <button
            className="quick-action"
            style={{ background: "var(--md-card)", border: "1px solid var(--md-border)", color: "var(--md-text)" }}
            onClick={() => navigate("/desaparecidos")}
          >
            <div className="qa-icon" style={{ background: "#FEF4E6" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="8" r="4" />
                <path d="M19 21a7 7 0 0 0-14 0" />
                <path d="m17 8 4 2" /><path d="m21 8-4 2" />
              </svg>
            </div>
            <span className="qa-label">Personas desaparecidas</span>
          </button>

          {/* Noticias */}
          <button
            className="quick-action"
            style={{ background: "var(--md-card)", border: "1px solid var(--md-border)", color: "var(--md-text)" }}
            onClick={() => navigate("/noticias")}
          >
            <div className="qa-icon" style={{ background: "#EAF0FE" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18h-5" /><path d="M18 14h-8" /><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              </svg>
            </div>
            <span className="qa-label">Noticias</span>
          </button>

          {/* Tiendas */}
          <button
            className="quick-action"
            style={{ background: "var(--md-card)", border: "1px solid var(--md-border)", color: "var(--md-text)" }}
            onClick={() => navigate("/marketplace")}
          >
            <div className="qa-icon" style={{ background: "#F1EAFB" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m2 7 4.4-4.4A2 2 0 0 1 7.8 2h8.4a2 2 0 0 1 1.4.6L22 7" />
                <path d="M2 7h20v3a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" />
                <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
              </svg>
            </div>
            <span className="qa-label">Tiendas</span>
          </button>
        </div>
      </div>

      {/* Near you */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--md-text)" }}>Cerca de ti</span>
          <a href="#" style={{ fontSize: 13, fontWeight: 600, color: "var(--md-info)" }}>Ver mapa</a>
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          {/* Mini map placeholder */}
          <div
            style={{
              height: 110,
              position: "relative",
              background: "repeating-linear-gradient(135deg, #EAEFEC 0px 11px, #E3E9E5 11px 22px)",
            }}
          >
            {/* Map pins */}
            <div
              style={{
                position: "absolute",
                top: 34,
                left: 70,
                width: 24,
                height: 24,
                borderRadius: "50% 50% 50% 0",
                transform: "rotate(-45deg)",
                background: "var(--md-danger)",
                boxShadow: "0 3px 6px rgba(0,0,0,.25)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 56,
                left: 180,
                width: 20,
                height: 20,
                borderRadius: "50% 50% 50% 0",
                transform: "rotate(-45deg)",
                background: "var(--md-warning)",
                boxShadow: "0 3px 6px rgba(0,0,0,.25)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 26,
                left: 250,
                width: 20,
                height: 20,
                borderRadius: "50% 50% 50% 0",
                transform: "rotate(-45deg)",
                background: "var(--md-primary)",
                boxShadow: "0 3px 6px rgba(0,0,0,.25)",
              }}
            />
          </div>
          {/* Incident card */}
          <div style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: 11,
                background: "#FDECEC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--md-text)" }}>
                Robo en Jr. Progreso
              </div>
              <div style={{ fontSize: 12, color: "var(--md-muted)", marginTop: 2 }}>
                8 vecinos confirmaron · hace 15 min
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
