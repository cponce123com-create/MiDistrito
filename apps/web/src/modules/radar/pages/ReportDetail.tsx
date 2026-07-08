import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReportDetail, useConfirmReport } from "../hooks/useRadarApi";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";
import Lightbox from "../components/Lightbox";

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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useReportDetail(id);

  const confirmMutation = useConfirmReport();

  const handleConfirm = () => {
    if (!report || confirmMutation.isPending) return;
    confirmMutation.mutate(report.id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  // --------------- Loading ---------------
  if (isLoading) {
    return (
      <div>
        <button
          className="btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "8px 14px", fontSize: 13 }}
          onClick={() => navigate(-1)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Volver
        </button>
        <SkeletonCard count={1} variant="card" />
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <SkeletonCard count={3} variant="list" />
        </div>
      </div>
    );
  }

  // --------------- Error ---------------
  if (isError || !report) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <EmptyState
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
          title={error instanceof Error ? error.message : "Reporte no encontrado"}
          message="El reporte que buscas no existe o fue eliminado."
          action={{ label: "Volver", onClick: () => navigate(-1) }}
        />
      </div>
    );
  }

  const statusClass = STATUS_CHIP[report.status] || "chip-precaución";
  const statusLabel = STATUS_LABEL[report.status] || report.status;
  const categoryEmoji = CATEGORY_EMOJI[report.category] || "";
  const categoryLabel = CATEGORY_LABEL[report.category] || report.category;

  return (
    <div>
      {/* ---------- Lightbox ---------- */}
      {lightboxOpen && report.imageUrl && (
        <Lightbox
          images={[report.imageUrl]}
          initialIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* ---------- Back button ---------- */}
      <button
        className="btn-secondary"
        style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "8px 14px", fontSize: 13 }}
        onClick={() => navigate(-1)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* ---------- Image hero ---------- */}
      {report.imageUrl && (
        <div
          className="card-hover"
          style={{
            overflow: "hidden",
            marginBottom: 14,
            cursor: "pointer",
          }}
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={report.imageUrl}
            alt={report.title}
            style={{
              width: "100%",
              height: 200,
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      )}

      {/* ---------- Report card ---------- */}
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

        {/* Description */}
        {report.description && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--md-muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {report.description}
            </p>
          </div>
        )}

        {/* Info rows */}
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
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
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

        {/* Confirmations */}
        {report.confirmations > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "var(--md-primary-50)", borderRadius: 8, fontSize: 13, color: "var(--md-primary)", marginBottom: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {report.confirmations} vecino{report.confirmations !== 1 ? "s" : ""} confirm{report.confirmations !== 1 ? "aron" : "ó"} este reporte
          </div>
        )}

        {/* Confirm button */}
        <button
          className="btn-primary"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "transform 0.1s",
          }}
          onClick={handleConfirm}
          disabled={confirmMutation.isPending}
        >
          {confirmMutation.isPending ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Confirmando...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Yo también vi esto
            </>
          )}
        </button>

        {confirmMutation.isSuccess && (
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--md-success)", textAlign: "center" }}>
            Gracias por confirmar. Tu reporte ayuda a la comunidad.
          </p>
        )}

        {confirmMutation.isError && (
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--md-danger)", textAlign: "center" }}>
            {(confirmMutation.error as any)?.message === "API error: 409"
              ? "Ya confirmaste este reporte."
              : "No se pudo confirmar. Intenta de nuevo."}
          </p>
        )}
      </div>
    </div>
  );
}
