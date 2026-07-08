import { useNavigate } from "react-router-dom";

interface Article {
  id: number;
  title: string;
  images: string[] | null;
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
  articles: Article[];
  categories: Category[];
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
  return new Date(dateStr).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

export default function NewsSidebar({ articles, categories }: Props) {
  const navigate = useNavigate();
  const latest = articles.slice(0, 5);

  return (
    <aside>
      {/* Latest news */}
      {latest.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "var(--md-text)", paddingBottom: 8, borderBottom: "2px solid var(--md-primary)" }}>
            Últimas noticias
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {latest.map((article) => {
              const imgUrl = getImageUrl(article);
              return (
                <div
                  key={article.id}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: "1px solid var(--md-border)",
                    cursor: "pointer",
                    alignItems: "flex-start",
                  }}
                  onClick={() => navigate(`/noticias/${article.id}`)}
                >
                  {imgUrl && (
                    <img
                      src={imgUrl}
                      alt=""
                      style={{ width: 56, height: 42, borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
                      loading="lazy"
                    />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <span
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--md-text)",
                        lineHeight: 1.35,
                      }}
                    >
                      {article.title}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--md-muted)", marginTop: 2, display: "block" }}>
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "var(--md-text)", paddingBottom: 8, borderBottom: "2px solid var(--md-primary)" }}>
            Categorías
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 8px",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "background 0.12s",
                }}
                onClick={() => navigate(`/noticias?categoria=${cat.slug}`)}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: cat.color || "var(--md-primary)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--md-text)" }}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
