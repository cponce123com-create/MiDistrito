import { useNavigate } from "react-router-dom";

interface Article {
  id: number;
  title: string;
  summary: string | null;
  body: string | null;
  author: string | null;
  images: string[] | null;
  categoryId: number | null;
  publishedAt: string | null;
  createdAt: string;
  fetchedAt: string;
}

interface Category {
  id: number;
  name: string;
  color: string | null;
  slug: string;
}

interface Props {
  article: Article;
  category?: Category | null;
  size?: "sm" | "md" | "lg";
  horizontal?: boolean;
  index?: number;
}

function getImageUrl(article: Article): string | null {
  if (article.images && Array.isArray(article.images) && article.images.length > 0) {
    const first = article.images[0];
    if (typeof first === "string") return first;
    if (typeof first === "object" && first !== null) return (first as any).url || (first as any).src || null;
  }
  return null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function readingTime(body: string | null): number {
  if (!body) return 0;
  const words = body.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function ArticleCard({ article, category, size = "md", horizontal = false, index = 0 }: Props) {
  const navigate = useNavigate();
  const imgUrl = getImageUrl(article);
  const catColor = category?.color ?? "var(--md-primary)";
  const catName = category?.name ?? "";
  const delay = Math.min(index, 5) * 0.07;

  const handleClick = () => navigate(`/noticias/${article.id}`);

  const cardStyle: React.CSSProperties = {
    cursor: "pointer",
    animation: `fadeInUp 0.4s ease ${delay}s both`,
  };

  /* ── Horizontal variant ── */
  if (horizontal) {
    return (
      <div
        className="card"
        style={{ ...cardStyle, display: "flex", gap: 14, padding: 14, borderTop: `3px solid ${catColor}` }}
        onClick={handleClick}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {catName && (
            <span style={{ fontSize: 11, fontWeight: 700, color: catColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {catName}
            </span>
          )}
          <h3 style={{ margin: "4px 0", fontSize: size === "sm" ? 14 : 15, fontWeight: 700, color: "var(--md-text)", lineHeight: 1.35 }}>
            {article.title}
          </h3>
          <div style={{ fontSize: 11, color: "var(--md-muted)", display: "flex", gap: 8 }}>
            {article.author && <span>{article.author}</span>}
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
            {article.body && <span>{readingTime(article.body)} min</span>}
          </div>
        </div>
        {imgUrl && (
          <div style={{ width: 100, height: 72, flexShrink: 0, borderRadius: 8, overflow: "hidden" }}>
            <img src={imgUrl} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
          </div>
        )}
      </div>
    );
  }

  /* ── Vertical variant ── */
  const titleSize = size === "lg" ? 18 : size === "sm" ? 13 : 14;

  return (
    <div
      className="card"
      style={{ ...cardStyle, overflow: "hidden", borderTop: `3px solid ${catColor}` }}
      onClick={handleClick}
    >
      {imgUrl ? (
        <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "var(--md-border)" }}>
          <img
            src={imgUrl}
            alt={article.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
            loading="lazy"
          />
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "16/9",
            background: "repeating-linear-gradient(135deg, var(--md-primary-50) 0px 12px, var(--md-border) 12px 13px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 24, color: "var(--md-primary-300)", fontWeight: 800 }}>MD</span>
        </div>
      )}
      <div style={{ padding: size === "sm" ? 10 : 14 }}>
        {catName && (
          <span className="chip chip-info" style={{ fontSize: 10, padding: "2px 8px", marginBottom: 6, background: `${catColor}18`, color: catColor }}>
            {catName}
          </span>
        )}
        <h3 style={{ margin: "2px 0 4px", fontSize: titleSize, fontWeight: 700, color: "var(--md-text)", lineHeight: 1.35 }}>
          {article.title}
        </h3>
        {article.summary && size !== "sm" && (
          <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--md-muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {article.summary}
          </p>
        )}
        <div style={{ fontSize: 11, color: "var(--md-muted)", display: "flex", gap: 8 }}>
          {article.author && <span>{article.author}</span>}
          <span>{formatDate(article.publishedAt || article.createdAt)}</span>
          {article.body && <span>{readingTime(article.body)} min de lectura</span>}
        </div>
      </div>
    </div>
  );
}
