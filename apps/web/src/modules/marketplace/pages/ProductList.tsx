import { useEffect, useState } from "react";
import { useDistrict } from "../../../core/DistrictContext";

export default function ProductList() {
  const { currentDistrict, currentDistrictId } = useDistrict();
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    if (!currentDistrictId) return;
    fetch(`/api/marketplace/products?districtId=${currentDistrictId}`)
      .then(r => r.json()).then(setProducts).catch(() => {});
    fetch(`/api/marketplace/stores?districtId=${currentDistrictId}`)
      .then(r => r.json()).then(setStores).catch(() => {});
  }, [currentDistrictId]);

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 20, margin: "0 0 18px 0", color: "var(--md-text)" }}>
        Marketplace — {currentDistrict}
      </h2>

      {/* Stores carousel */}
      <div style={{ marginBottom: 22 }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "var(--md-text)" }}>Tiendas</h3>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
          {stores.map((s: any) => (
            <div key={s.id} className="card" style={{ minWidth: 140, padding: 12, flexShrink: 0 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "var(--md-text)" }}>{s.name}</p>
              <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--md-muted)" }}>{s.businessType}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {products.map((p: any) => (
          <div key={p.id} className="card" style={{ overflow: "hidden" }}>
            {p.imageUrl && (
              <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
            )}
            <div style={{ padding: 10 }}>
              <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 13, color: "var(--md-text)" }}>{p.name}</p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--md-primary)" }}>S/ {p.price}</p>
              {p.salePrice && (
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--md-success)" }}>Oferta: S/ {p.salePrice}</p>
              )}
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--md-muted)" }}>{p.unit}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
