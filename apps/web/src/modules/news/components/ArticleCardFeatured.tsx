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
  large?: boolean;
}

function getImageUrl(article: Article): string | null {
  if (article.images && Array.isArray(article.images) && article.images.length > 0) {
    const first = article.images[0];
    if (typeof first === "string") return first;
    if (typeof first === "object" && first !== null) return (first as any).url || (first as any).src || null;
  }
  return null;
}

export default function ArticleCardFeatured({ article, category, large = false }: Props) {
  const navigate = useNavigate();
  const imgUrl = getImageUrl(article);
  const catColor = category?.color ?? "var(--md-primary)";
  const catName = category?.name ?? "Noticia";

  const handleClick = () => navigate(`/noticias/${article.id}`);

  /* ── Large hero variant ── */
  if (large) {
    return (
      <div
        className="card"
        style={{
          overflow: "hidden",
          position: "relative",
          cursor: "pointer",
          minHeight: 300,
          animation: "fadeIn 0.5s ease both",
        }}
        onClick={handleClick}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={article.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              inset: 0,
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg, var(--md-primary-700), var(--md-primary))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 48, color: "rgba(255,255,255,0.08)", fontWeight: 800 }}>MD</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.12) 28%, rgba(0,0,0,0.5) 62%, rgba(0,0,0,0.88) 100%)",
          }}
        />

        {/* Content */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "20px 24px 24px", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ background: catColor, color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", letterSpacing: "0.08em" }}>
              {catName.toUpperCase()}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, lineHeight: 1.25, letterSpacing: "-0.01em" }}>
            {article.title}
          </h2>
          {article.summary && (
            <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.85, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {article.summary}
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ── Standard featured variant ── */
  return (
    <div
      className="card"
      style={{ overflow: "hidden", cursor: "pointer", animation: "fadeInUp 0.4s ease both" }}
      onClick={handleClick}
    >
      {imgUrl ? (
        <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
          <img
            src={imgUrl}
            alt={article.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
            loading="eager"
          />
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "16/9",
            background: `linear-gradient(135deg, var(--md-primary-50), var(--md-primary-300))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 32, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>MD</span>
        </div>
      )}
      <div style={{ padding: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: catColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {catName}
        </span>
        <h3 style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 700, color: "var(--md-text)", lineHeight: 1.35 }}>
          {article.title}
        </h3>
        {article.summary && (
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--md-muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {article.summary}
          </p>
        )}
      </div>
    </div>
  );
}
