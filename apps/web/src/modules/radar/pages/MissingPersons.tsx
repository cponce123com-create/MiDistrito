import { useDistrict } from "../../../core/DistrictContext";
import { useMissingPersons } from "../hooks/useRadarApi";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";

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

// --------------- Component ---------------
export default function MissingPersons() {
  const { currentDistrictId, currentDistrict } = useDistrict();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useMissingPersons();

  const persons = data?.persons ?? [];

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
        message="Para ver personas desaparecidas, selecciona un distrito desde el menú superior."
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 22, margin: 0, color: "var(--md-text)" }}>
            Personas desaparecidas
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--md-muted)" }}>
            {currentDistrict}
          </p>
        </div>
      </div>

      {/* ---------- Loading ---------- */}
      {isLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <SkeletonCard count={4} variant="card" />
        </div>
      )}

      {/* ---------- Error ---------- */}
      {isError && !isLoading && (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--md-danger)" }}>
            {error instanceof Error
              ? error.message
              : "No se pudieron cargar las personas desaparecidas."}
          </p>
          <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => refetch()}>
            Reintentar
          </button>
        </div>
      )}

      {/* ---------- Empty ---------- */}
      {!isLoading && !isError && persons.length === 0 && (
        <EmptyState
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="8" r="4" />
              <path d="M19 21a7 7 0 0 0-14 0" />
              <path d="m17 8 4 2" />
              <path d="m21 8-4 2" />
            </svg>
          }
          title="No se reportan personas desaparecidas"
          message={`No hay reportes de personas desaparecidas en ${currentDistrict}.`}
        />
      )}

      {/* ---------- Data ---------- */}
      {!isLoading && !isError && persons.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {persons.map((p) => (
            <div key={p.id} className="card-hover" style={{ overflow: "hidden" }}>
              <div
                style={{
                  height: 100,
                  background: "linear-gradient(135deg, var(--md-primary-50) 0%, #D1EDE8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  color: "var(--md-primary-700)",
                  fontWeight: 700,
                  position: "relative",
                }}
              >
                {p.name.charAt(0)}
                {p.status === "found" && (
                  <span className="chip chip-resuelto" style={{ position: "absolute", top: 8, right: 8, fontSize: 11, padding: "3px 8px" }}>
                    Encontrado
                  </span>
                )}
                {p.status === "active" && (
                  <span className="chip chip-alerta" style={{ position: "absolute", top: 8, right: 8, fontSize: 11, padding: "3px 8px" }}>
                    Activo
                  </span>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--md-text)" }}>
                  {p.name}
                </p>
                <p style={{ margin: "2px 0", fontSize: 12, color: "var(--md-muted)" }}>
                  {p.age} años
                </p>
                {p.clothing && (
                  <p style={{ margin: "2px 0", fontSize: 12, color: "var(--md-muted)" }}>
                    Vestimenta: {p.clothing}
                  </p>
                )}
                {p.lastSeenAddress && (
                  <p style={{ margin: "2px 0", fontSize: 12, color: "var(--md-muted)" }}>
                    {p.lastSeenAddress}
                  </p>
                )}
                {p.lastSeenDate && (
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--md-muted)" }}>
                    Visto por última vez: {new Date(p.lastSeenDate).toLocaleDateString("es-PE")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
