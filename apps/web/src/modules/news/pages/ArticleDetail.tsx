import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDistrict } from "../../../core/DistrictContext";
import NewsSidebar from "../components/NewsSidebar";

interface Article {
  id: number;
  title: string;
  summary: string | null;
  body: string | null;
  author: string | null;
  images: string[] | null;
  categoryId: number | null;
  sourceId: number;
  url: string;
  status: string;
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

function getImageUrl(article: Article): string | null {
  if (article.images && Array.isArray(article.images) && article.images.length > 0) {
    const first = article.images[0];
    if (typeof first === "string") return first;
    if (typeof first === "object" && first !== null) return (first as any).url || (first as any).src || null;
  }
  return null;
}

function getGalleryImages(article: Article): string[] {
  if (article.images && Array.isArray(article.images)) {
    return article.images.map((img) => {
      if (typeof img === "string") return img;
      if (typeof img === "object" && img !== null) return (img as any).url || (img as any).src || "";
      return "";
    }).filter(Boolean);
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

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentDistrictId } = useDistrict();

  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/news/articles/${id}`).then((r) => {
        if (!r.ok) throw new Error("Artículo no encontrado");
        return r.json();
      }),
      fetch(`/api/news/categories`).then((r) => r.json()),
      currentDistrictId
        ? fetch(`/api/news/articles?districtId=${currentDistrictId}&limit=5`).then((r) => r.json())
        : Promise.resolve({ articles: [] }),
    ])
      .then(([articleData, categoriesData, latestData]) => {
        setArticle(articleData);
        setCategories(categoriesData || []);
        setLatestArticles(latestData.articles || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, currentDistrictId]);

  const getCategory = (categoryId: number | null): Category | null => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId) || null;
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, color: "var(--md-muted)", padding: "60px 0" }}>
        <div className="animate-spin h-6 w-6 border-2 border-[var(--md-primary)] border-t-transparent rounded-full" />
        <span style={{ fontSize: 14 }}>Cargando artículo...</span>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !article) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div className="card" style={{ padding: 32, display: "inline-block" }}>
          <p style={{ margin: "0 0 8px", fontSize: 15, color: "var(--md-danger)", fontWeight: 600 }}>
            {error || "Artículo no encontrado"}
          </p>
          <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => navigate("/noticias")}>
            ← Volver a noticias
          </button>
        </div>
      </div>
    );
  }

  const category = getCategory(article.categoryId);
  const catColor = category?.color || "var(--md-primary)";
  const imgUrl = getImageUrl(article);
  const gallery = getGalleryImages(article);
  const rt = readingTime(article.body);

  return (
    <div>
      {/* Back button */}
      <button
        className="btn-secondary"
        style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "8px 14px", fontSize: 13, height: "auto" }}
        onClick={() => navigate("/noticias")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
        </svg>
        Volver a noticias
      </button>

      <div style={{ display: "grid", gridTemplateColumns: { lg: "1fr 280px" } as any, gap: 24 }}>
        <div>
          {/* Hero image */}
          {imgUrl ? (
            <div
              className="card"
              style={{ overflow: "hidden", marginBottom: 20, width: "100%", aspectRatio: "16/9" }}
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
                background: `linear-gradient(135deg, var(--md-primary-50), var(--md-primary-300))`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 48, color: "rgba(255,255,255,0.2)", fontWeight: 800 }}>MD</span>
            </div>
          )}

          {/* Category badge */}
          {category && (
            <span
              className="chip chip-info"
              style={{
                background: `${catColor}18`,
                color: catColor,
                fontSize: 11,
                padding: "4px 12px",
                marginBottom: 10,
              }}
            >
              {category.name}
            </span>
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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {article.author}
              </span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
            {rt > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--md-text)", marginBottom: 12 }}>
                Galería
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {gallery.slice(1).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8 }}
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Source link */}
          {article.url && (
            <div style={{ marginTop: 24, padding: 14, background: "var(--md-bg)", borderRadius: "var(--radius-md)" }}>
              <p style={{ margin: 0, fontSize: 12, color: "var(--md-muted)" }}>
                Fuente:{' '}
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
          <NewsSidebar articles={latestArticles} categories={categories} />
        </div>
      </div>
    </div>
  );
}
