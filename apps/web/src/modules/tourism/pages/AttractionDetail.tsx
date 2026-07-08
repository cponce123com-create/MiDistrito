import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function AttractionDetail() {
  const { id } = useParams();
  const [attraction, setAttraction] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/tourism/attractions/${id}`).then(r => r.json()).then(setAttraction).catch(() => {});
  }, [id]);

  if (!attraction) return (
    <div className="p-4" style={{ color: "var(--md-muted)", display: "flex", alignItems: "center", gap: 10 }}>
      <div className="animate-spin h-5 w-5 border-2 border-[var(--md-primary)] border-t-transparent rounded-full" />
      Cargando...
    </div>
  );

  return (
    <div className="p-4">
      {attraction.imageUrl && <img src={attraction.imageUrl} alt={attraction.name} className="w-full h-48 object-cover rounded mb-4" />}
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--md-text)" }}>{attraction.name}</h1>
      <span className="chip chip-info">{attraction.attractionType}</span>
      <p className="mt-4" style={{ color: "var(--md-text)" }}>{attraction.description}</p>
      {attraction.schedule && <p className="mt-2"><span style={{ color: "var(--md-muted)" }}>Horario:</span> {attraction.schedule}</p>}
      {attraction.entryFee && <p className="mt-1"><span style={{ color: "var(--md-muted)" }}>Entrada:</span> {attraction.entryFee}</p>}
      {attraction.address && <p className="mt-1"><span style={{ color: "var(--md-muted)" }}>Dirección:</span> {attraction.address}</p>}
      {attraction.phone && <p className="mt-1"><span style={{ color: "var(--md-muted)" }}>Teléfono:</span> {attraction.phone}</p>}
      {attraction.website && <p className="mt-1"><a href={attraction.website} style={{ color: "var(--md-info)" }}>Sitio web</a></p>}
      {attraction.howToGetThere && <div className="mt-4"><h3 className="font-semibold" style={{ color: "var(--md-text)" }}>Cómo llegar</h3><p className="text-sm" style={{ color: "var(--md-muted)" }}>{attraction.howToGetThere}</p></div>}
      {attraction.tips && <div className="mt-4"><h3 className="font-semibold" style={{ color: "var(--md-text)" }}>Recomendaciones</h3><p className="text-sm" style={{ color: "var(--md-muted)" }}>{attraction.tips}</p></div>}
      {attraction.reviews?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2" style={{ color: "var(--md-text)" }}>Reseñas</h3>
          {attraction.reviews.map((r: any) => (
            <div key={r.id} className="card mb-2" style={{ padding: 12 }}>
              <div className="flex items-center gap-1 mb-1">{Array.from({ length: r.rating }).map((_, i) => <span key={i}>⭐</span>)}</div>
              <p className="text-sm" style={{ color: "var(--md-text)" }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
