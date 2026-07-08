import type React from "react";

interface Props {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, message, action }: Props) {
  return (
    <div
      className="card"
      style={{
        padding: "48px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        animation: "fadeIn 0.4s ease",
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 16,
          background: "var(--md-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--md-muted)",
          opacity: 0.5,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: "var(--md-text)",
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 13,
            color: "var(--md-muted)",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
      </div>
      {action && (
        <button className="btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
