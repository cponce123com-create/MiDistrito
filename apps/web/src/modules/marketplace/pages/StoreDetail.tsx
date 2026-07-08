import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
  categoryName: string | null;
  tags: string[] | null;
}

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
  products: Product[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function StoreDetail() {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/marketplace/stores/${id}`)
      .then((r) => r.json())
      .then(setStore)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 256,
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
      </div>
    );
  }

  if (!store) {
    return (
      <div
        style={{
          padding: 0,
          textAlign: "center",
          color: "var(--md-muted)",
          fontSize: 14,
        }}
      >
        Tienda no encontrada.
      </div>
    );
  }

  return (
    <div>
      {/* Store header */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        {store.bannerUrl && (
          <img
            src={store.bannerUrl}
            alt=""
            style={{
              width: "100%",
              height: 120,
              objectFit: "cover",
              borderRadius: 8,
              marginBottom: 12,
            }}
          />
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.name}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--md-primary-50)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--md-primary-700)",
              }}
            >
              {store.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: "var(--md-text)",
              }}
            >
              {store.name}
            </h1>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 13,
                color: "var(--md-muted)",
                textTransform: "capitalize",
              }}
            >
              {store.businessType?.replace(/_/g, " ")}
            </p>
          </div>
        </div>
        {store.description && (
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 13,
              color: "var(--md-muted)",
              lineHeight: 1.5,
            }}
          >
            {store.description}
          </p>
        )}
        {store.whatsapp && (
          <a
            href={`https://wa.me/${store.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ marginTop: 12, textDecoration: "none", display: "inline-flex" }}
          >
            Contactar por WhatsApp
          </a>
        )}
      </div>

      {/* Products */}
      <h3
        style={{
          margin: "0 0 12px",
          fontSize: 15,
          fontWeight: 700,
          color: "var(--md-text)",
        }}
      >
        Productos
      </h3>
      {store.products?.length === 0 ? (
        <p style={{ color: "var(--md-muted)", fontSize: 13 }}>
          Esta tienda aún no tiene productos.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {store.products?.map((p: Product) => (
            <div key={p.id} className="card" style={{ overflow: "hidden" }}>
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
                  <span style={{ fontSize: 11, color: "var(--md-muted)" }}>
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
                {p.categoryName && (
                  <span
                    className="chip chip-info"
                    style={{ marginTop: 6, display: "inline-flex" }}
                  >
                    {p.categoryName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
