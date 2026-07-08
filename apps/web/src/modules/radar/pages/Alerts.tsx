import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDistrict } from "../../../core/DistrictContext";
import { usePanicAlertStream } from "../hooks/usePanicAlertStream";

interface Stats {
  totalReports: number;
  activeAlerts: number;
  todayIncidents: number;
  resolvedToday: number;
}

interface PanicAlert {
  id: number;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
  authorName: string;
  sector: string;
  isActive: boolean;
  createdAt: string;
}

const ALERT_TYPE_CONFIG: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  robbery:     { icon: "\uD83D\uDD34", label: "Robo",          color: "var(--md-danger)",  bg: "#FDECEC" },
  medical:     { icon: "\uD83D\uDE91", label: "Emergencia M\u00E9dica", color: "#16A34A",     bg: "#E9F6EE" },
  fight:       { icon: "\u2694\uFE0F",  label: "Pelea",          color: "#D97706",     bg: "#FEF4E6" },
  fire:        { icon: "\uD83D\uDD25", label: "Incendio",       color: "var(--md-danger)",  bg: "#FDECEC" },
  missing_person: { icon: "\uD83D\uDD0D", label: "Desaparecido",  color: "#2563EB",     bg: "#EAF0FE" },
  other:       { icon: "\u26A0\uFE0F",  label: "Alerta General", color: "var(--md-muted)", bg: "#F3F4F6" },
};

function getAlertConfig(type: string) {
  return ALERT_TYPE_CONFIG[type] || ALERT_TYPE_CONFIG.other;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `Hace ${diffD}d`;
}

export default function Alerts() {
  const navigate = useNavigate();
  const { currentDistrictId, currentDistrict } = useDistrict();

  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<PanicAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePanicAlertStream();

  useEffect(() => {
    if (!currentDistrictId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/radar/stats?districtId=${currentDistrictId}`).then(r => r.json()),
      fetch(`/api/radar/panic-alerts?districtId=${currentDistrictId}&active=true`).then(r => r.json()),
    ])
      .then(([statsData, alertsData]) => {
        setStats(statsData);
        setAlerts(alertsData.alerts || []);
      })
      .catch(() => setError("No se pudieron cargar los datos del radar."))
      .finally(() => setLoading(false));
  }, [currentDistrictId]);

  if (!currentDistrictId) {
    return (
      <div style={{ color: "var(--md-muted)", textAlign: "center", padding: "40px 0" }}>
        Selecciona un distrito para ver el radar vecinal.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--md-muted)", padding: "40px 0" }}>
        <div className="animate-spin h-5 w-5 border-2 border-[var(--md-primary)] border-t-transparent rounded-full" />
        Cargando radar vecinal...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--md-danger)" }}>
        <p style={{ margin: 0 }}>{error}</p>
        <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 22, margin: 0, color: "var(--md-text)" }}>
            Radar Vecinal
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--md-muted)" }}>
            {currentDistrict}
          </p>
        </div>
        <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => navigate("/reportar")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v8" /><path d="M8 12h8" /><circle cx="12" cy="12" r="10" />
          </svg>
          Nueva alerta
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: "#FDECEC" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--md-danger)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="metric-value" style={{ color: "var(--md-danger)" }}>{stats?.activeAlerts ?? 0}</div>
          <div className="metric-label">Alertas activas</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: "#FEF4E6" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="metric-value">{stats?.todayIncidents ?? 0}</div>
          <div className="metric-label">Incidentes hoy</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: "var(--md-primary-50)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--md-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" /><path d="M9 21V9" />
            </svg>
          </div>
          <div className="metric-value">{stats?.totalReports ?? 0}</div>
          <div className="metric-label">Reportes totales</div>
        </div>
      </div>

      {/* Panic alerts section */}
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, margin: 0, color: "var(--md-text)" }}>
          Alertas de pánico activas
        </h2>
        {alerts.length > 0 && (
          <span className="chip chip-alerta" style={{ fontSize: 11, padding: "2px 10px" }}>
            {alerts.length} activa{alerts.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--md-muted)" }}>
            No hay alertas de pánico activas en {currentDistrict}.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {alerts.map((alert) => {
            const cfg = getAlertConfig(alert.type);
            return (
              <div key={alert.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: cfg.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 18,
                    }}
                  >
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "var(--md-text)" }}>
                        {cfg.label}
                      </span>
                      <span className="chip chip-alerta" style={{ fontSize: 11, padding: "3px 8px" }}>Alerta</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--md-muted)" }}>
                      {alert.address || alert.sector}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--md-muted)" }}>
                      {alert.authorName} · {relativeTime(alert.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
