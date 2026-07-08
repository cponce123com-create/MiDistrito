import { useEffect, useState } from "react";
import { useAuth } from "../../../core/AuthContext";
import { useDistrict } from "../../../core/DistrictContext";

export default function NewsList() {
  const { user } = useAuth();
  const { currentDistrict, currentDistrictId } = useDistrict();
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    if (!currentDistrictId) return;
    fetch(`/api/news/articles?districtId=${currentDistrictId}`)
      .then((r) => r.json())
      .then((data) => setArticles(data.articles || []))
      .catch(() => {});
  }, [currentDistrictId]);

  const statusChip = (status: string) => {
    const map: Record<string, string> = {
      published: "chip chip-resuelto",
      pending_approval: "chip chip-precaución",
      draft: "chip chip-info",
      rejected: "chip chip-alerta",
    };
    return map[status] || "chip chip-info";
  };

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 20, margin: "0 0 18px 0", color: "var(--md-text)" }}>
        Noticias — {currentDistrict}
      </h2>
      {articles.length === 0 ? (
        <p style={{ color: "var(--md-muted)", fontSize: 14 }}>No hay noticias aún.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {articles.map((a: any) => (
            <div key={a.id} className="card" style={{ padding: 14 }}>
              <h3 style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 14, color: "var(--md-text)" }}>
                {a.title}
              </h3>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--md-muted)", lineHeight: 1.5 }}>
                {a.summary?.slice(0, 150)}...
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--md-muted)" }}>
                <span>{a.author || "Sin autor"}</span>
                <span>•</span>
                <span className={statusChip(a.status)} style={{ fontSize: 11, padding: "3px 8px" }}>
                  {a.status === "published" ? "Publicado" :
                   a.status === "pending_approval" ? "Pendiente" :
                   a.status === "draft" ? "Borrador" : a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {user && ["admin", "super_admin", "editor"].includes(user.role) && (
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <a href="/noticias/fuentes" className="btn-secondary" style={{ textDecoration: "none", fontSize: 13 }}>
            Fuentes
          </a>
          <a href="/noticias/aprobar" className="btn-primary" style={{ textDecoration: "none", fontSize: 13 }}>
            Aprobar
          </a>
        </div>
      )}
    </div>
  );
}
