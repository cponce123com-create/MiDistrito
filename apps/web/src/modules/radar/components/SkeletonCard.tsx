import type React from "react";

interface Props {
  count?: number;
  variant?: "card" | "metric" | "list";
}

/* ── Shimmer bar ── */
function Bar({ width, height }: { width: number | string; height: number }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height,
        borderRadius: 6,
      }}
    />
  );
}

/* ── Variant: card (16:9 image + 3 lines) ── */
function SkeletonCardView() {
  return (
    <div
      className="card"
      style={{
        overflow: "hidden",
        animation: "fadeIn 0.4s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 16:9 placeholder */}
      <div
        className="skeleton-shimmer"
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
        }}
      />
      {/* Text lines */}
      <div
        style={{
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Bar width="65%" height={14} />
        <Bar width="90%" height={12} />
        <Bar width="40%" height={12} />
      </div>
    </div>
  );
}

/* ── Variant: metric (small square + long + short) ── */
function SkeletonMetric() {
  return (
    <div className="metric-card">
      <div
        className="skeleton-shimmer"
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          marginBottom: 9,
        }}
      />
      <div
        className="skeleton-shimmer"
        style={{
          width: 48,
          height: 30,
          borderRadius: 6,
          marginBottom: 4,
        }}
      />
      <div
        className="skeleton-shimmer"
        style={{
          width: 72,
          height: 14,
          borderRadius: 4,
        }}
      />
    </div>
  );
}

/* ── Variant: list (circle + 2 lines horizontal) ── */
function SkeletonList() {
  return (
    <div
      className="card"
      style={{
        padding: 14,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        animation: "fadeIn 0.4s ease",
      }}
    >
      <div
        className="skeleton-shimmer"
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          flexShrink: 0,
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Bar width="50%" height={14} />
        <Bar width="80%" height={12} />
      </div>
    </div>
  );
}

export default function SkeletonCard({
  count = 1,
  variant = "card",
}: Props) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === "metric") {
    return (
      <>
        {items.map((i) => (
          <SkeletonMetric key={i} />
        ))}
      </>
    );
  }

  if (variant === "list") {
    return (
      <>
        {items.map((i) => (
          <SkeletonList key={i} />
        ))}
      </>
    );
  }

  return (
    <>
      {items.map((i) => (
        <SkeletonCardView key={i} />
      ))}
    </>
  );
}
