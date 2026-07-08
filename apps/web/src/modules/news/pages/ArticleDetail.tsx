import { useParams, useNavigate } from "react-router-dom";
import { useDistrict } from "../../../core/DistrictContext";
import {
  useArticleDetail,
  useArticles,
  type NewsArticle,
  type NewsCategory,
} from "../hooks/useNewsApi";
import NewsSidebar from "../components/NewsSidebar";
import SkeletonCard from "../../radar/components/SkeletonCard";
import EmptyState from "../../radar/components/EmptyState";

/* ── Helpers ── */

function getImageUrl(article: NewsArticle): string | null {
  if (article.images && Array.isArray(article.images) && article.images.length > 0) {
    const first = article.images[0];
    if (typeof first === "string") return first;
    if (typeof first === "object" && first !== null) return (first as any).url || (first as any).src || null;
  }
  return null;
}

function getGalleryImages(article: NewsArticle): string[] {
  if (article.images && Array.isArray(article.images)) {
    return article.images
      .map((img) => {
        if (typeof img === "string") return img;
        if (typeof img === "object" && img !== null) return (img as any).url || (img as any).src || "";
        return "";
      })
      .filter(Boolean);
  }
  return [];
}

function readingTime(body: string | null): number {
  if (!body) return 0;
  const words = body.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Component ── */

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentDistrictId } = useDistrict();

  const articleQuery = useArticleDetail(id);
  const sidebarQuery = useArticles({ limit: 5 });

  const article = articleQuery.data ?? null;
  const queryError = articleQuery.error;
  const isLoading = articleQuery.isLoading;
  const sidebarArticles = sidebarQuery.data?.articles ?? [];
  const sidebarLoading = sidebarQuery.isLoading;

  const getCategory = (categoryId: number | null): NewsCategory | undefined => {
    if (!categoryId) return undefined;
    // categories come from the article's category context — we fetch alongside
    return undefined;
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div>
        {/* Back button placeholder */}
        <div
          className="btn-secondary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 20,
            padding: "8px 14px",
            fontSize: 13,
            height: "auto",
            opacity: 0.5,
            pointerEvents: "none",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Volver a noticias
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: { lg: "1fr 280px" } as any,
            gap: 24,
          }}
        >
          <div>
            <SkeletonCard count={1} variant="card" />
          </div>
          <div className="desktop-only" style={{ display: "none" }}>
            <style>{`@media(min-width:768px){.desktop-only{display:block!important}}`}</style>
            <SkeletonCard count={5} variant="list" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (queryError || !article) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 0",
        }}
      >
        <EmptyState
          icon={
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
          title="Artículo no encontrado"
          message={
            queryError instanceof Error
              ? queryError.message
              : "El artículo que buscas no está disponible."
          }
          action={{
            label: "← Volver a noticias",
            onClick: () => navigate("/noticias"),
          }}
        />
      </div>
    );
  }

  const category = undefined;
  const catColor = "var(--md-primary)";
  const imgUrl = getImageUrl(article);
  const gallery = getGalleryImages(article);
  const rt = readingTime(article.body);

  return (
    <div>
      {/* Back button */}
      <button
        className="btn-secondary"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 20,
          padding: "8px 14px",
          fontSize: 13,
          height: "auto",
        }}
        onClick={() => navigate("/noticias")}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
        Volver a noticias
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: { lg: "1fr 280px" } as any,
          gap: 24,
        }}
      >
        <div>
          {/* Hero image */}
          {imgUrl ? (
            <div
              className="card"
              style={{
                overflow: "hidden",
                marginBottom: 20,
                width: "100%",
                aspectRatio: "16/9",
              }}
            >
              <img
                src={imgUrl}
                alt={article.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : (
            <div
              className="card"
              style={{
                marginBottom: 20,
                width: "100%",
                aspectRatio: "16/9",
                background:
                  "linear-gradient(135deg, var(--md-primary-50), var(--md-primary-300))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 48,
                  color: "rgba(255,255,255,0.2)",
                  fontWeight: 800,
                }}
              >
                MD
              </span>
            </div>
          )}

          {/* Title */}
          <h1
            style={{
              margin: "8px 0 12px",
              fontSize: 22,
              fontWeight: 800,
              color: "var(--md-text)",
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
            }}
          >
            {article.title}
          </h1>

          {/* Meta */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              fontSize: 12,
              color: "var(--md-muted)",
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: "1px solid var(--md-border)",
            }}
          >
            {article.author && (
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {article.author}
              </span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
            {rt > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {rt} min de lectura
              </span>
            )}
          </div>

          {/* Summary */}
          {article.summary && (
            <div
              style={{
                padding: 16,
                marginBottom: 20,
                background: "var(--md-primary-50)",
                borderRadius: "var(--radius-md)",
                fontSize: 14,
                color: "var(--md-primary-700)",
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              {article.summary}
            </div>
          )}

          {/* Body */}
          {article.body && (
            <div
              style={{
                fontSize: 15,
                color: "var(--md-text)",
                lineHeight: 1.75,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {article.body}
            </div>
          )}

          {/* Gallery */}
          {gallery.length > 1 && (
            <div style={{ marginTop: 24 }}>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--md-text)",
                  marginBottom: 12,
                }}
              >
                Galería
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {gallery.slice(1).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    style={{
                      width: "100%",
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Source link */}
          {article.url && (
            <div
              style={{
                marginTop: 24,
                padding: 14,
                background: "var(--md-bg)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "var(--md-muted)" }}>
                Fuente:{" "}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--md-info)", fontSize: 12 }}
                >
                  {new URL(article.url).hostname}
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Sidebar — desktop */}
        <div className="desktop-only" style={{ display: "none" }}>
          <style>{`@media(min-width:768px){.desktop-only{display:block!important}}`}</style>
          {sidebarLoading ? (
            <SkeletonCard count={5} variant="list" />
          ) : (
            <div className="card-hover">
              <NewsSidebar
                articles={sidebarArticles}
                categories={[]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
