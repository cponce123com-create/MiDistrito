import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDistrict } from "../../../core/DistrictContext";
import {
  useArticles,
  useNewsCategories,
  type NewsArticle,
  type NewsCategory,
} from "../hooks/useNewsApi";
import ArticleCard from "../components/ArticleCard";
import ArticleCardFeatured from "../components/ArticleCardFeatured";
import NewsSidebar from "../components/NewsSidebar";
import SkeletonCard from "../../radar/components/SkeletonCard";
import EmptyState from "../../radar/components/EmptyState";

export default function NewsList() {
  const navigate = useNavigate();
  const { currentDistrict, currentDistrictId } = useDistrict();

  const [page, setPage] = useState(1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const articlesQuery = useArticles({ limit, offset });
  const categoriesQuery = useNewsCategories();

  // Accumulate articles across pages for "load more"
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const lastPageRef = useRef(0);

  useEffect(() => {
    if (articlesQuery.data?.articles) {
      setAllArticles((prev) => {
        if (page === 1) return articlesQuery.data!.articles;
        const existingIds = new Set(prev.map((a) => a.id));
        const newOnes = articlesQuery.data!.articles.filter(
          (a) => !existingIds.has(a.id),
        );
        if (newOnes.length === 0) return prev;
        return [...prev, ...newOnes];
      });
      lastPageRef.current = page;
    }
  }, [articlesQuery.data, page]);

  // Reset on district change
  useEffect(() => {
    setPage(1);
    setAllArticles([]);
    lastPageRef.current = 0;
  }, [currentDistrictId]);

  const handleLoadMore = () => {
    setPage((p) => p + 1);
  };

  const total = articlesQuery.data?.total ?? 0;
  const hasMore = allArticles.length < total;
  const isLoading =
    articlesQuery.isLoading ||
    (articlesQuery.isFetching && allArticles.length === 0);
  const fetchError = articlesQuery.error;
  const categories = (categoriesQuery.data ?? []) as NewsCategory[];

  const getCategory = (
    categoryId: number | null,
  ): NewsCategory | undefined => {
    if (!categoryId) return undefined;
    return categories.find((c) => c.id === categoryId);
  };

  /* ── No district selected ── */
  if (!currentDistrictId) {
    return (
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
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        }
        title="Selecciona un distrito"
        message="Selecciona un distrito para ver las noticias."
      />
    );
  }

  /* ── Initial loading ── */
  if (isLoading) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: 20,
              margin: 0,
              color: "var(--md-text)",
            }}
          >
            Noticias — {currentDistrict}
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <SkeletonCard count={6} variant="card" />
        </div>
      </div>
    );
  }

  /* ── Error (no cached data) ── */
  if (fetchError && allArticles.length === 0) {
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
          title="Error al cargar"
          message={
            fetchError instanceof Error
              ? fetchError.message
              : "Error de conexión"
          }
          action={{
            label: "Reintentar",
            onClick: () => {
              setPage(1);
              setAllArticles([]);
            },
          }}
        />
      </div>
    );
  }

  /* ── Empty ── */
  if (allArticles.length === 0) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: 20,
              margin: 0,
              color: "var(--md-text)",
            }}
          >
            Noticias — {currentDistrict}
          </h2>
        </div>
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
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8v4h-8V6Z" />
            </svg>
          }
          title="No hay noticias"
          message={`No hay noticias disponibles en ${currentDistrict} aún.`}
        />
      </div>
    );
  }

  const featured = allArticles[0];
  const regularArticles = allArticles.slice(1);
  const latest = allArticles.slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontWeight: 700,
            fontSize: 20,
            margin: 0,
            color: "var(--md-text)",
          }}
        >
          Noticias — {currentDistrict}
        </h2>
        <button
          className="btn-secondary"
          style={{ fontSize: 12, padding: "6px 14px", height: "auto" }}
          onClick={() => navigate("/noticias/fuentes")}
        >
          Fuentes
        </button>
      </div>

      {/* Inline error banner when there's cached data */}
      {fetchError && (
        <div
          className="card"
          style={{
            padding: 12,
            marginBottom: 16,
            background: "#FDECEC",
            color: "var(--md-danger)",
            fontSize: 13,
            border: "none",
          }}
        >
          {fetchError instanceof Error
            ? fetchError.message
            : "Error de conexión"}{" "}
          ·{" "}
          <span
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => {
              setPage(1);
              setAllArticles([]);
            }}
          >
            reintentar
          </span>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        {/* Featured article */}
        {featured && (
          <div className="card-hover">
            <ArticleCardFeatured
              article={featured}
              category={getCategory(featured.categoryId)}
              large
            />
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: { lg: "1fr 280px" } as any,
            gap: 24,
          }}
        >
          {/* Main grid */}
          <div>
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
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 17,
                      fontWeight: 700,
                      color: "var(--md-text)",
                    }}
                  >
                    Últimas noticias
                  </h3>
                  {total > limit && (
                    <span style={{ fontSize: 11, color: "var(--md-muted)" }}>
                      {allArticles.length} de {total}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  {regularArticles.map((article, i) => (
                    <div key={article.id} className="card-hover">
                      <ArticleCard
                        article={article}
                        category={getCategory(article.categoryId)}
                        index={i}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Load more */}
            {hasMore && (
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <button
                  className="btn-secondary"
                  onClick={handleLoadMore}
                  disabled={articlesQuery.isFetching}
                >
                  {articlesQuery.isFetching
                    ? "Cargando..."
                    : `Cargar más noticias (${allArticles.length} de ${total})`}
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
