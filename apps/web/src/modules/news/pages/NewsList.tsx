import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDistrict } from "../../../core/DistrictContext";
import ArticleCard from "../components/ArticleCard";
import ArticleCardFeatured from "../components/ArticleCardFeatured";
import NewsSidebar from "../components/NewsSidebar";

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

function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ width: "100%", aspectRatio: "16/9", background: "var(--md-border)" }} />
      <div style={{ padding: 14 }}>
        <div style={{ height: 10, width: 80, background: "var(--md-border)", borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 14, width: "100%", background: "var(--md-border)", borderRadius: 4, marginBottom: 4 }} />
        <div style={{ height: 14, width: "70%", background: "var(--md-border)", borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function NewsList() {
  const navigate = useNavigate();
  const { currentDistrict, currentDistrictId } = useDistrict();

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchData = useCallback(async (pageNum: number) => {
    if (!currentDistrictId) return;
    setLoading(true);
    setError(null);

    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        fetch(`/api/news/articles?districtId=${currentDistrictId}&limit=${limit}&offset=${(pageNum - 1) * limit}`),
        fetch(`/api/news/categories`),
      ]);

      if (!articlesRes.ok) throw new Error("Error al cargar noticias");

      const articlesData = await articlesRes.json();
      const categoriesData = await categoriesRes.json();

      if (pageNum === 1) {
        setArticles(articlesData.articles || []);
      } else {
        setArticles((prev) => [...prev, ...(articlesData.articles || [])]);
      }
      setTotal(articlesData.total || 0);
      setCategories(categoriesData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [currentDistrictId]);

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [fetchData]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage);
  };

  const getCategory = (categoryId: number | null): Category | null => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId) || null;
  };

  const hasMore = articles.length < total;

  /* ── No district selected ── */
  if (!currentDistrictId) {
    return (
      <div style={{ color: "var(--md-muted)", textAlign: "center", padding: "40px 0" }}>
        Selecciona un distrito para ver las noticias.
      </div>
    );
  }

  /* ── Loading ── */
  if (loading && articles.length === 0) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, margin: 0, color: "var(--md-text)" }}>
            Noticias — {currentDistrict}
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error && articles.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <p style={{ margin: "0 0 12px", color: "var(--md-danger)", fontSize: 14 }}>{error}</p>
        <button className="btn-secondary" onClick={() => fetchData(1)}>Reintentar</button>
      </div>
    );
  }

  /* ── Empty ── */
  if (articles.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <h2 style={{ fontWeight: 700, fontSize: 20, margin: "0 0 12px", color: "var(--md-text)" }}>
          Noticias — {currentDistrict}
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "var(--md-muted)" }}>
          No hay noticias disponibles en {currentDistrict} aún.
        </p>
      </div>
    );
  }

  const featured = articles[0];
  const regularArticles = articles.slice(1);
  const latest = articles.slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontWeight: 700, fontSize: 20, margin: 0, color: "var(--md-text)" }}>
          Noticias — {currentDistrict}
        </h2>
        <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 14px", height: "auto" }} onClick={() => navigate("/noticias/fuentes")}>
          Fuentes
        </button>
      </div>

      {error && (
        <div className="card" style={{ padding: 12, marginBottom: 16, background: "#FDECEC", color: "var(--md-danger)", fontSize: 13, border: "none" }}>
          {error} · <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => fetchData(1)}>reintentar</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, marginBottom: 24 }}>
        {/* Featured article */}
        {featured && (
          <ArticleCardFeatured article={featured} category={getCategory(featured.categoryId)} large />
        )}

        <div style={{ display: "grid", gridTemplateColumns: { lg: "1fr 280px" } as any, gap: 24 }}>
          {/* Main grid */}
          <div>
            {/* Latest news section */}
            {regularArticles.length > 0 && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    paddingBottom: 10,
                    borderBottom: "2px solid var(--md-text)",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--md-text)" }}>
                    Últimas noticias
                  </h3>
                  {total > limit && (
                    <span style={{ fontSize: 11, color: "var(--md-muted)" }}>
                      {articles.length} de {total}
                    </span>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {regularArticles.map((article, i) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      category={getCategory(article.categoryId)}
                      index={i}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Load more */}
            {hasMore && (
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <button className="btn-secondary" onClick={handleLoadMore} disabled={loading}>
                  {loading ? "Cargando..." : `Cargar más noticias (${articles.length} de ${total})`}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar — desktop only */}
          <div className="desktop-only" style={{ display: "none" }}>
            <style>{`@media(min-width:768px){.desktop-only{display:block!important}}`}</style>
            <NewsSidebar articles={latest} categories={categories} />
          </div>
        </div>
      </div>
    </div>
  );
}
