import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDistrict } from "../../../core/DistrictContext";

interface Store {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  businessType: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  isActive: boolean;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  unit: string;
  stock: number | null;
  categoryId: number | null;
  tags: string[] | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function ProductList() {
  const { currentDistrict, currentDistrictId } = useDistrict();
  const navigate = useNavigate();

  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!currentDistrictId) return;
    setLoading(true);
    setError(null);

    try {
      const [storesRes, productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/marketplace/stores?districtId=${currentDistrictId}`),
        fetch(`/api/marketplace/products?districtId=${currentDistrictId}`),
        fetch(`/api/marketplace/categories`),
      ]);

      if (!storesRes.ok || !productsRes.ok || !categoriesRes.ok) {
        throw new Error("Error al cargar datos del marketplace");
      }

      const storesData: Store[] = await storesRes.json();
      const productsData: Product[] = await productsRes.json();
      const categoriesData: Category[] = await categoriesRes.json();

      setStores(storesData);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [currentDistrictId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.categoryId === selectedCategoryId)
    : products;

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 256,
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "4px solid var(--md-border)",
            borderTopColor: "var(--md-primary)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ margin: 0, fontSize: 13, color: "var(--md-muted)" }}>
          Cargando tiendas...
        </p>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--md-danger)" }}>
          {error}
        </p>
        <button className="btn-secondary" onClick={fetchAll}>
          Reintentar
        </button>
      </div>
    );
  }

  /* ---------- Empty ---------- */
  if (stores.length === 0 && products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <h2
          style={{
            fontWeight: 700,
            fontSize: 20,
            margin: "0 0 18px",
            color: "var(--md-text)",
          }}
        >
          Tiendas — {currentDistrict}
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "var(--md-muted)" }}>
          No hay tiendas disponibles en este distrito aún.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <h2
        style={{
          fontWeight: 700,
          fontSize: 20,
          margin: "0 0 18px",
          color: "var(--md-text)",
        }}
      >
        Tiendas — {currentDistrict}
      </h2>

      {/* Categories chips */}
      {categories.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
            marginBottom: 18,
          }}
        >
          <button
            className={`chip ${selectedCategoryId === null ? "chip-info" : ""}`}
            style={{
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              background:
                selectedCategoryId === null
                  ? undefined
                  : "var(--md-card)",
              color:
                selectedCategoryId === null
                  ? undefined
                  : "var(--md-muted)",
              border:
                selectedCategoryId === null
                  ? undefined
                  : "1.5px solid var(--md-border)",
            }}
            onClick={() => setSelectedCategoryId(null)}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`chip ${selectedCategoryId === cat.id ? "chip-info" : ""}`}
              style={{
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                background:
                  selectedCategoryId === cat.id
                    ? undefined
                    : "var(--md-card)",
                color:
                  selectedCategoryId === cat.id
                    ? undefined
                    : "var(--md-muted)",
                border:
                  selectedCategoryId === cat.id
                    ? undefined
                    : "1.5px solid var(--md-border)",
              }}
              onClick={() =>
                setSelectedCategoryId(
                  selectedCategoryId === cat.id ? null : cat.id
                )
              }
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Stores horizontal scroll */}
      {stores.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3
            style={{
              margin: "0 0 10px",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--md-text)",
            }}
          >
            Tiendas
          </h3>
          <div
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {stores.map((s) => (
              <div
                key={s.id}
                className="card"
                style={{
                  minWidth: 160,
                  padding: 14,
                  flexShrink: 0,
                  cursor: "pointer",
                  transition: "transform 0.1s",
                }}
                onClick={() => navigate(`/marketplace/store/${s.id}`)}
                onMouseDown={(e) => {
                  const target = e.currentTarget;
                  target.style.transform = "scale(0.97)";
                  setTimeout(() => {
                    target.style.transform = "";
                  }, 100);
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  {s.logoUrl ? (
                    <img
                      src={s.logoUrl}
                      alt={s.name}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "var(--md-primary-50)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "var(--md-primary-700)",
                        flexShrink: 0,
                      }}
                    >
                      {s.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: 13,
                        color: "var(--md-text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.name}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 11,
                        color: "var(--md-muted)",
                        textTransform: "capitalize",
                      }}
                    >
                      {s.businessType?.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                {s.description && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: "var(--md-muted)",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {s.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products grid */}
      <h3
        style={{
          margin: "0 0 10px",
          fontSize: 15,
          fontWeight: 700,
          color: "var(--md-text)",
        }}
      >
        Productos
        {selectedCategoryId && categories.find((c) => c.id === selectedCategoryId)
          ? ` — ${categories.find((c) => c.id === selectedCategoryId)!.name}`
          : ""}
      </h3>

      {filteredProducts.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: "var(--md-muted)" }}>
          No hay productos en esta categoría.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{ overflow: "hidden" }}
            >
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  style={{
                    width: "100%",
                    height: 110,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}
              <div style={{ padding: 10 }}>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--md-text)",
                  }}
                >
                  {p.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--md-primary)",
                  }}
                >
                  {formatCurrency(p.price)}
                </p>
                {p.salePrice != null && (
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 12,
                      color: "var(--md-success)",
                      fontWeight: 600,
                    }}
                  >
                    Oferta: {formatCurrency(p.salePrice)}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--md-muted)",
                    }}
                  >
                    {p.unit}
                  </span>
                  {p.stock != null && (
                    <span
                      style={{
                        fontSize: 11,
                        color:
                          p.stock > 0
                            ? "var(--md-success)"
                            : "var(--md-danger)",
                        fontWeight: 600,
                      }}
                    >
                      {p.stock > 0 ? `${p.stock} ud.` : "Agotado"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
