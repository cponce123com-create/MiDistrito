import { useEffect, useState } from "react";
import { useDistrict } from "../../../core/DistrictContext";
import { Link } from "react-router-dom";

export default function EventsList() {
  const { currentDistrict, currentDistrictId } = useDistrict();
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!currentDistrictId) return;
    const url = `/api/events/calendar?districtId=${currentDistrictId}&upcoming=true${filter ? `&category=${filter}` : ""}`;
    fetch(url).then(r => r.json()).then(setEvents).catch(() => {});
  }, [currentDistrictId, filter]);

  const categories = ["cultural", "sports", "civic", "educational", "fair", "music", "workshop"];

  const formatDate = (d: string) => new Date(d).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--md-text)" }}>Eventos — {currentDistrict}</h1>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        <button
          onClick={() => setFilter("")}
          className="btn-secondary"
          style={!filter ? { background: "var(--md-primary)", color: "#fff", borderColor: "var(--md-primary)" } : {}}
        >Todos</button>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className="btn-secondary"
            style={filter === c ? { background: "var(--md-primary)", color: "#fff", borderColor: "var(--md-primary)" } : {}}
          >{c}</button>
        ))}
      </div>
      <div className="space-y-3">
        {events.map((e: any) => (
          <Link key={e.id} to={`/eventos/${e.id}`} className="card block" style={{ padding: 16, display: "block" }}>
            {e.imageUrl && <img src={e.imageUrl} alt={e.title} className="w-full h-24 object-cover rounded mb-2" />}
            <div className="flex items-start gap-3">
              <div className="text-center min-w-[48px]">
                <div className="text-xl font-bold" style={{ color: "var(--md-primary)" }}>{new Date(e.startDate).getDate()}</div>
                <div className="text-xs" style={{ color: "var(--md-muted)" }}>{new Date(e.startDate).toLocaleDateString("es-PE", { month: "short" })}</div>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold" style={{ color: "var(--md-text)" }}>{e.title}</h2>
                <p className="text-sm" style={{ color: "var(--md-muted)" }}>{e.shortDescription?.slice(0, 80)}...</p>
                <span className="chip chip-info mt-1 inline-block">{e.category}</span>
              </div>
            </div>
          </Link>
        ))}
        {events.length === 0 && <p style={{ color: "var(--md-muted)" }}>No hay eventos próximos.</p>}
      </div>
    </div>
  );
}
