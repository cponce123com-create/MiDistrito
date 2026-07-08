import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDistrict } from "../../../core/DistrictContext";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRadarStats, useReports } from "../hooks/useRadarApi";
import { usePanicAlertStream } from "../hooks/usePanicAlertStream";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";
import Lightbox from "../components/Lightbox";

// --------------- Fix Leaflet default icons ---------------
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function markerIcon(color: string) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-${color}.png`,
    iconRetinaUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
  });
}

const CATEGORY_COLOR: Record<string, string> = {
  robbery: "red",
  fight: "orange",
  fire: "red",
  medical: "green",
  missing_person: "blue",
  vial: "orange",
  alumbrado: "orange",
  basura: "orange",
  seguridad: "yellow",
  other: "green",
};

const CATEGORY_LABEL: Record<string, string> = {
  robbery: "Robo",
  medical: "Emergencia Médica",
  fight: "Pelea",
  fire: "Incendio",
  missing_person: "Desaparecido",
  vial: "Problema vial",
  alumbrado: "Alumbrado público",
  basura: "Recojo de basura",
  seguridad: "Seguridad",
  other: "Otro",
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `Hace ${diffD}d`;
}

// --------------- Heatmap Layer Component ---------------
function HeatmapLayer({ reports, viewMode }: { reports: Array<{ latitude: number; longitude: number; confirmations: number }>; viewMode: "map" | "heat" }) {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (viewMode === "heat" && reports.length > 0) {
      const points: Array<[number, number, number]> = reports.map((r) => [
        r.latitude,
        r.longitude,
        Math.max(r.confirmations, 1),
      ]);
      const layer = (L as any).heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: Math.max(...reports.map((r) => r.confirmations), 10),
        gradient: { 0.4: "blue", 0.6: "cyan", 0.7: "lime", 0.8: "yellow", 1.0: "red" },
      });
      layer.addTo(map);
      heatLayerRef.current = layer;
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, reports, viewMode]);

  return null;
}

// --------------- Component ---------------
export default function Home() {
  const navigate = useNavigate();
  const { currentDistrictId, currentDistrict } = useDistrict();
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: statsRefetch,
  } = useRadarStats();

  const {
    data: reportsData,
    isLoading: reportsLoading,
  } = useReports({ limit: 50 });

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  // Heatmap toggle state
  const [viewMode, setViewMode] = useState<"map" | "heat">("map");

  // SSE para alertas en vivo
  usePanicAlertStream();

  // Último reporte para la card destacada
  const latestReport = reportsData?.reports?.[0] ?? null;

  // Centro del mapa
  const defaultCenter: [number, number] = [-12.0432, -77.0282]; // Lima
  const mapCenter: [number, number] = [defaultCenter[0], defaultCenter[1]];
  const reports = reportsData?.reports ?? [];
  const avgLat =
    reports.length > 0
      ? reports.reduce((s, r) => s + r.latitude, 0) / reports.length
      : mapCenter[0];
  const avgLng =
    reports.length > 0
      ? reports.reduce((s, r) => s + r.longitude, 0) / reports.length
      : mapCenter[1];

  // --------------- No district selected ---------------
  if (!currentDistrictId) {
    return (
      <EmptyState
        icon={
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        }
        title="Selecciona un distrito"
        message="Para ver el radar vecinal, selecciona un distrito desde el menú superior."
      />
    );
  }

  const openLightbox = (images: string[]) => {
    setLightboxImages(images);
    setLightboxOpen(true);
  };

  return (
    <div>
      {/* ---------- Lightbox ---------- */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          initialIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* ---------- Metrics ---------- */}
      {statsLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <SkeletonCard count={3} variant="metric" />
        </div>
      ) : statsError ? (
        <div className="card" style={{ padding: 16, textAlign: "center", color: "var(--md-danger)" }}>
          <p style={{ margin: "0 0 8px", fontSize: 13 }}>
            No se pudieron cargar las métricas.
          </p>
          <button className="btn-secondary" style={{ height: 36, fontSize: 13 }} onClick={() => statsRefetch()}>
            Reintentar
          </button>
        </div>
      ) : stats ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: "#FEF4E6" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <div className="metric-value">{stats.activeAlerts}</div>
            <div className="metric-label">Alertas activas</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: "var(--md-primary-50)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--md-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="metric-value">{stats.todayIncidents}</div>
            <div className="metric-label">Incidentes hoy</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: "#E9F6EE" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.8 10A10 10 0 1 1 17 3.3" />
                <path d="m9 11 3 3L22 4" />
              </svg>
            </div>
            <div className="metric-value">{stats.resolvedToday}</div>
            <div className="metric-label">Resueltos hoy</div>
          </div>
        </div>
      ) : null}

      {/* ---------- Quick Actions ---------- */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--md-text)", marginBottom: 12 }}>
          Acciones rápidas
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button
            className="quick-action"
            style={{ background: "var(--md-primary)", color: "#fff", border: "none" }}
            onClick={() => navigate("/reportar")}
          >
            <div className="qa-icon" style={{ background: "rgba(255,255,255,0.2)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v8" />
                <path d="M8 12h8" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <span className="qa-label">Reportar incidencia</span>
          </button>

          <button
            className="quick-action"
            style={{ background: "var(--md-card)", border: "1px solid var(--md-border)", color: "var(--md-text)" }}
            onClick={() => navigate("/desaparecidos")}
          >
            <div className="qa-icon" style={{ background: "#FEF4E6" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="8" r="4" />
                <path d="M19 21a7 7 0 0 0-14 0" />
                <path d="m17 8 4 2" />
                <path d="m21 8-4 2" />
              </svg>
            </div>
            <span className="qa-label">Personas desaparecidas</span>
          </button>

          <button
            className="quick-action"
            style={{ background: "var(--md-card)", border: "1px solid var(--md-border)", color: "var(--md-text)" }}
            onClick={() => navigate("/noticias")}
          >
            <div className="qa-icon" style={{ background: "#EAF0FE" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18h-5" />
                <path d="M18 14h-8" />
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              </svg>
            </div>
            <span className="qa-label">Noticias</span>
          </button>

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

      {/* ---------- Near you — Map ---------- */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--md-text)" }}>
            Cerca de ti
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              style={{
                height: 30,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid var(--md-border)",
                background: viewMode === "heat" ? "var(--md-primary)" : "var(--md-card)",
                color: viewMode === "heat" ? "#fff" : "var(--md-text)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
              onClick={() => setViewMode(viewMode === "map" ? "heat" : "map")}
            >
              {viewMode === "map" ? "Mapa" : "Calor"}
            </button>
            <a
              href="#"
              style={{ fontSize: 13, fontWeight: 600, color: "var(--md-info)" }}
              onClick={(e) => { e.preventDefault(); navigate("/reportes"); }}
            >
              Ver todos
            </a>
          </div>
        </div>

        {reportsLoading ? (
          <SkeletonCard count={1} variant="card" />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
            title="No hay reportes"
            message={`No hay reportes recientes en ${currentDistrict}.`}
            action={{ label: "Crear reporte", onClick: () => navigate("/reportar") }}
          />
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ height: 200, width: "100%" }}>
              <MapContainer
                center={[avgLat, avgLng]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <HeatmapLayer reports={reports} viewMode={viewMode} />
                {viewMode === "map" && reports.map((r) => {
                  const color = CATEGORY_COLOR[r.category] || CATEGORY_COLOR.other;
                  return (
                    <Marker key={r.id} position={[r.latitude, r.longitude]} icon={markerIcon(color)}>
                      <Popup>
                        <strong>{r.title}</strong>
                        <br />
                        <span style={{ fontSize: 12 }}>{CATEGORY_LABEL[r.category] || r.category}</span>
                        <br />
                        <span style={{ fontSize: 11, color: "#666" }}>{relativeTime(r.createdAt)}</span>
                        {r.imageUrl && (
                          <>
                            <br />
                            <img
                              src={r.imageUrl}
                              alt=""
                              style={{
                                width: 80,
                                height: 60,
                                borderRadius: 6,
                                objectFit: "cover",
                                marginTop: 6,
                                cursor: "pointer",
                              }}
                              onClick={() => openLightbox([r.imageUrl!])}
                            />
                          </>
                        )}
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            {/* Featured incident below map */}
            {latestReport && (
              <div
                className="card-hover"
                style={{
                  padding: 14,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  cursor: "pointer",
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  border: "none",
                  borderTop: "1px solid var(--md-border)",
                }}
                onClick={() => navigate(`/reportes/${latestReport.id}`)}
              >
                <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, background: "#FDECEC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--md-text)" }}>
                    {latestReport.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--md-muted)", marginTop: 2 }}>
                    {latestReport.address || latestReport.sector} · {relativeTime(latestReport.createdAt)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
