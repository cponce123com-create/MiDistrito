import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Report {
  id: number;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string;
  sector: string;
  authorName: string;
  createdAt: string;
  confirmations: number;
}

const STATUS_CHIP: Record<string, string> = {
  pending: "chip-precaución",
  in_progress: "chip-precaución",
  resolved: "chip-resuelto",
  rejected: "chip-alerta",
  reported: "chip-robo",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En proceso",
  resolved: "Resuelto",
  rejected: "Rechazado",
  reported: "Reportado",
};

const CATEGORY_LABEL: Record<string, string> = {
  robbery: "Robo",
  medical: "Emergencia Médica",
  fight: "Pelea",
  fire: "Incendio",
  missing_person: "Persona Desaparecida",
  vial: "Problema vial",
  alumbrado: "Alumbrado público",
  basura: "Recojo de basura",
  seguridad: "Seguridad",
  other: "Otro",
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

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`/api/radar/reports/${id}`)
      .then(r => {
        if (!r.ok) throw new Error("Reporte no encontrado");
        return r.json();
      })
      .then(setReport)
      .catch(() => setError("No se pudo cargar el reporte."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, color: "var(--md-muted)", padding: "60px 0" }}>
        <div className="animate-spin h-6 w-6 border-2 border-[var(--md-primary)] border-t-transparent rounded-full" />
        <span style={{ fontSize: 14 }}>Cargando reporte...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div className="card" style={{ padding: 32, display: "inline-block" }}>
          <p style={{ margin: "0 0 8px", fontSize: 15, color: "var(--md-danger)", fontWeight: 600 }}>
            {error || "Reporte no encontrado"}
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--md-muted)" }}>
            El reporte que buscas no existe o fue eliminado.
          </p>
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  const statusClass = STATUS_CHIP[report.status] || "chip-precaución";
  const statusLabel = STATUS_LABEL[report.status] || report.status;
  const categoryEmoji = CATEGORY_EMOJI[report.category] || "";
  const categoryLabel = CATEGORY_LABEL[report.category] || report.category;

  return (
    <div>
      <button
        className="btn-secondary"
        style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "8px 14px", fontSize: 13 }}
        onClick={() => navigate(-1)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
        </svg>
        Volver
      </button>

      <div className="card" style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{categoryEmoji}</span>
              <h2 style={{ fontWeight: 700, fontSize: 17, margin: 0, color: "var(--md-text)" }}>
                {report.title}
              </h2>
            </div>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--md-muted)" }}>
              {categoryLabel}
            </p>
          </div>
          <span className={`chip ${statusClass}`} style={{ fontSize: 12, padding: "4px 12px", whiteSpace: "nowrap", flexShrink: 0 }}>
            {statusLabel}
          </span>
        </div>

        {report.description && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--md-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {report.description}
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {report.address && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--md-muted)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {report.address}
              {report.sector && <span style={{ color: "var(--md-muted)" }}>· {report.sector}</span>}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--md-muted)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {new Date(report.createdAt).toLocaleDateString("es-PE", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {report.authorName && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--md-muted)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Reportado por {report.authorName}
            </div>
          )}
        </div>

        {report.confirmations > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "var(--md-primary-50)", borderRadius: 8, fontSize: 13, color: "var(--md-primary)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {report.confirmations} vecino{report.confirmations !== 1 ? "s" : ""} confirm{report.confirmations !== 1 ? "aron" : "ó"} este reporte
          </div>
        )}
      </div>
    </div>
  );
}
