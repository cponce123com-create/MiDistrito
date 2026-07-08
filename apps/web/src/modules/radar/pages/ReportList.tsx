import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useReports, useReportCategories, type Report } from "../hooks/useRadarApi";
import { useDistrict } from "../../../core/DistrictContext";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CHIP: Record<string, string> = {
  active: "chip-alerta",
  reviewing: "chip-precaución",
  resolved: "chip-resuelto",
  archived: "chip-info",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  reviewing: "Revisando",
  resolved: "Resuelto",
  archived: "Archivado",
};

const CATEGORY_EMOJI: Record<string, string> = {
  robbery: "\uD83D\uDD34",
  medical: "\uD83D\uDE91",
  fight: "\u2694\uFE0F",
  fire: "\uD83D\uDD25",
  missing_person: "\uD83D\uDD0D",
  vial: "\uD83D\uDEE4\uFE0F",
  alumbrado: "\uD83D\uDCA1",
  basura: "\uD83D\uDDD1\uFE0F",
  seguridad: "\uD83D\uDCAA",
  other: "\u26A0\uFE0F",
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

const STATUSES = ["active", "reviewing", "resolved"] as const;

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

// ── Component ───────────────────────────────────────────────────────────────

export default function ReportList() {
  const navigate = useNavigate();
  const { currentDistrictId, currentDistrict } = useDistrict();

  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sectorFilter, setSectorFilter] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [limit, setLimit] = useState(20);

  const { data: categoriesData } = useReportCategories();

  const {
    data: reportsData,
    isLoading,
    isError,
    refetch,
  } = useReports({
    category: categoryFilter || undefined,
    status: statusFilter || undefined,
    limit,
    offset: 0,
  });

  const reports = reportsData?.reports ?? [];
  const total = reportsData?.total ?? 0;

  // Stats derived from reports for sector filter
  const sectors = useMemo(() => {
    const map = new Map<string, number>();
    reports.forEach((r) => {
      if (r.sector) map.set(r.sector, (map.get(r.sector) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([sector]) => sector);
  }, [reports]);

  // Client-side text search filter
  const filteredReports = useMemo(() => {
    if (!searchText.trim()) return reports;
    const q = searchText.toLowerCase();
    return reports.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)),
    );
  }, [reports, searchText]);

  // --------------- No district ---------------
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
        message="Para ver los reportes, selecciona un distrito desde el menú superior."
      />
    );
  }

  return (
    <div>
      {/* ---------- Header ---------- */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 22, margin: 0, color: "var(--md-text)" }}>
            Reportes
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--md-muted)" }}>
            {currentDistrict} · {total} reporte{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ---------- Search bar ---------- */}
      <div className="input-wrapper" style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", marginBottom: 12, height: 42 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--md-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por título..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "var(--md-text)", fontFamily: "var(--font-sans)", background: "transparent" }}
        />
      </div>

      {/* ---------- Filter bar ---------- */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ height: 34, padding: "0 12px", borderRadius: 8, border: "1px solid var(--md-border)", background: categoryFilter ? "var(--md-primary-50)" : "var(--md-card)", color: "var(--md-text)", fontSize: 13, fontFamily: "var(--font-sans)", cursor: "pointer", outline: "none" }}
        >
          <option value="">Todas las categorías</option>
          {(categoriesData ?? []).map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {CATEGORY_EMOJI[cat.slug] || ""} {cat.name}
            </option>
          ))}
        </select>

        {STATUSES.map((s) => {
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              className={`chip ${isActive ? STATUS_CHIP[s] || "chip-precaución" : ""}`}
              style={{ height: 34, padding: "0 14px", fontSize: 13, cursor: "pointer", border: isActive ? "none" : "1px solid var(--md-border)", background: isActive ? undefined : "var(--md-card)", color: isActive ? undefined : "var(--md-text)", fontFamily: "var(--font-sans)" }}
              onClick={() => setStatusFilter(isActive ? "" : s)}
            >
              {STATUS_LABEL[s]}
            </button>
          );
        })}

        {sectors.length > 0 && (
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            style={{ height: 34, padding: "0 12px", borderRadius: 8, border: "1px solid var(--md-border)", background: sectorFilter ? "var(--md-primary-50)" : "var(--md-card)", color: "var(--md-text)", fontSize: 13, fontFamily: "var(--font-sans)", cursor: "pointer", outline: "none" }}
          >
            <option value="">Todos los sectores</option>
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      {/* ---------- Loading ---------- */}
      {isLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <SkeletonCard count={4} variant="card" />
        </div>
      )}

      {/* ---------- Error ---------- */}
      {isError && !isLoading && (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--md-danger)" }}>
          <p style={{ margin: "0 0 8px", fontSize: 13 }}>No se pudieron cargar los reportes.</p>
          <button className="btn-secondary" style={{ height: 34, fontSize: 12 }} onClick={() => refetch()}>
            Reintentar
          </button>
        </div>
      )}

      {/* ---------- Empty ---------- */}
      {!isLoading && !isError && filteredReports.length === 0 && (
        !searchText ? (
          <EmptyState
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            }
            title="No hay reportes"
            message={`Sé el primero en reportar una incidencia en ${currentDistrict}.`}
            action={{ label: "Crear reporte", onClick: () => navigate("/reportar") }}
          />
        ) : (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <p style={{ margin: "0 0 4px", fontSize: 15, color: "var(--md-text)", fontWeight: 600 }}>
              Sin resultados
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--md-muted)" }}>
              Ningún reporte coincide con tu búsqueda.
            </p>
          </div>
        )
      )}

      {/* ---------- Report Grid ---------- */}
      {!isLoading && !isError && filteredReports.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {filteredReports.map((report: Report) => {
              const chipClass = STATUS_CHIP[report.status] || "chip-precaución";
              const statusLabel = STATUS_LABEL[report.status] || report.status;
              const emoji = CATEGORY_EMOJI[report.category] || "";
              const categoryLabel = CATEGORY_LABEL[report.category] || report.category;

              return (
                <div
                  key={report.id}
                  className="card-hover"
                  style={{
                    padding: 14,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                  onClick={() => navigate(`/reportes/${report.id}`)}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--md-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 14 }}>{emoji}</span>
                      {categoryLabel}
                    </span>
                    <span className={`chip ${chipClass}`} style={{ fontSize: 11, padding: "2px 10px", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {statusLabel}
                    </span>
                  </div>

                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--md-text)", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {report.title}
                  </span>

                  {report.description && (
                    <span style={{ fontSize: 12, color: "var(--md-muted)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {report.description}
                    </span>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", fontSize: 12, color: "var(--md-muted)" }}>
                    <span>{relativeTime(report.createdAt)}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                      {report.confirmations}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---------- Load More ---------- */}
          {reports.length < total && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button className="btn-secondary" style={{ height: 38, fontSize: 13, padding: "0 24px" }} onClick={() => setLimit((prev) => prev + 20)}>
                Cargar más reportes
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
