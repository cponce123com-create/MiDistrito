import { useState, useRef, useEffect } from "react";
import { useNotifications, useMarkNotificationRead, type Notification } from "../hooks/useRadarApi";
import { useDistrict } from "../../../core/DistrictContext";

/* ---------- SVG Icons ---------- */
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    <path d="M21 15.3a4 4 0 0 0-1-2.3l-1-1V8a7 7 0 0 0-14 0v4l-1 1a4 4 0 0 0-1 2.3" />
    <path d="M3 15.3h18" />
  </svg>
);

const BellOutlineIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    <path d="M21 15.3a4 4 0 0 0-1-2.3l-1-1V8a7 7 0 0 0-14 0v4l-1 1a4 4 0 0 0-1 2.3" />
    <path d="M3 15.3h18" />
  </svg>
);

/* ---------- Time helper ---------- */
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

/* ---------- Skeleton ---------- */
function NotificationSkeleton() {
  return (
    <div style={{ display: "flex", gap: 10, padding: "10px 14px", alignItems: "flex-start" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--md-border)", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ height: 12, width: "70%", borderRadius: 4, background: "var(--md-border)" }} />
        <div style={{ height: 10, width: "50%", borderRadius: 4, background: "var(--md-border)" }} />
      </div>
    </div>
  );
}

/* ---------- Type icon map ---------- */
function typeIcon(type: string) {
  switch (type) {
    case "panic_alert":
      return "\u{1F6A8}";
    case "missing_person":
      return "\u{1F50D}";
    case "report_update":
      return "\u{1F4CB}";
    case "report_nearby":
      return "\u{1F4CD}";
    default:
      return "\u{1F514}";
  }
}

/* ---------- NotificationCenter ---------- */
export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const { currentDistrictId } = useDistrict();

  const { data, isLoading, isError } = useNotifications();
  const markRead = useMarkNotificationRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Click outside to close ──
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // ── On error: ocultar componente ──
  if (isError) return null;
  if (!currentDistrictId) return null;

  return (
    <div style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        ref={btnRef}
        className="notification-bell"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notificaciones"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span
            className="badge"
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              background: "var(--md-danger)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              padding: "0 4px",
              border: "2px solid var(--md-card)",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="notification-panel"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 340,
            maxHeight: 420,
            overflowY: "auto",
            background: "var(--md-card)",
            border: "1px solid var(--md-border)",
            borderRadius: 12,
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid var(--md-border)",
              fontWeight: 600,
              fontSize: 14,
              color: "var(--md-text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Notificaciones</span>
            {unreadCount > 0 && (
              <span style={{ fontSize: 11, color: "var(--md-muted)", fontWeight: 400 }}>
                {unreadCount} sin leer
              </span>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div style={{ padding: "8px 0" }}>
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </div>
          )}

          {/* Empty */}
          {!isLoading && notifications.length === 0 && (
            <div
              style={{
                padding: "32px 14px",
                textAlign: "center",
                color: "var(--md-muted)",
              }}
            >
              <BellOutlineIcon />
              <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 500 }}>
                No tienes notificaciones
              </p>
            </div>
          )}

          {/* List */}
          {!isLoading &&
            notifications.map((n) => (
              <div
                key={n.id}
                className="notification-item"
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "10px 14px",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  background: n.isRead ? "transparent" : "var(--md-primary-50)",
                  borderBottom: "1px solid var(--md-border)",
                  alignItems: "flex-start",
                }}
                onClick={() => {
                  if (!n.isRead) markRead.mutate(Number(n.id));
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>
                  {typeIcon(n.type)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: n.isRead ? 400 : 600,
                      fontSize: 13,
                      color: "var(--md-text)",
                      lineHeight: 1.3,
                      marginBottom: 2,
                    }}
                  >
                    {n.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--md-muted)",
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {n.body}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--md-muted)",
                      marginTop: 4,
                      opacity: 0.7,
                    }}
                  >
                    {relativeTime(n.createdAt)}
                  </div>
                </div>
                {!n.isRead && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--md-primary)",
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
