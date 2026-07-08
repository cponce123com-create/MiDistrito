import { useEffect, useState } from "react";
import { useDistrict } from "../../../core/DistrictContext";

interface MissingPerson {
  id: number;
  name: string;
  age: number;
  lastSeenAddress: string;
  lastSeenDate: string;
  clothing: string;
  photoUrl?: string;
  status: string; // "active" | "found"
  createdAt: string;
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

export default function MissingPersons() {
  const { currentDistrictId, currentDistrict } = useDistrict();
  const [persons, setPersons] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentDistrictId) return;
    setLoading(true);
    setError(null);

    fetch(`/api/radar/missing-persons?districtId=${currentDistrictId}`)
      .then(r => r.json())
      .then(data => setPersons(data.persons || []))
      .catch(() => setError("No se pudieron cargar las personas desaparecidas."))
      .finally(() => setLoading(false));
  }, [currentDistrictId]);

  if (!currentDistrictId) {
    return (
      <div style={{ color: "var(--md-muted)", textAlign: "center", padding: "40px 0" }}>
        Selecciona un distrito para ver personas desaparecidas.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--md-muted)", padding: "40px 0" }}>
        <div className="animate-spin h-5 w-5 border-2 border-[var(--md-primary)] border-t-transparent rounded-full" />
        Cargando personas desaparecidas...
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

      {persons.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--md-muted)" }}>
            No se reportan personas desaparecidas en {currentDistrict}.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {persons.map((p) => (
            <div key={p.id} className="card" style={{ overflow: "hidden" }}>
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
                  <span
                    className="chip chip-resuelto"
                    style={{ position: "absolute", top: 8, right: 8, fontSize: 11, padding: "3px 8px" }}
                  >
                    Encontrado
                  </span>
                )}
                {p.status === "active" && (
                  <span
                    className="chip chip-alerta"
                    style={{ position: "absolute", top: 8, right: 8, fontSize: 11, padding: "3px 8px" }}
                  >
                    Activo
                  </span>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--md-text)" }}>{p.name}</p>
                <p style={{ margin: "2px 0", fontSize: 12, color: "var(--md-muted)" }}>{p.age} años</p>
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
