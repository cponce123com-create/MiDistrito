import { useEffect, useState } from "react";
import { useDistrict } from "../../../core/DistrictContext";
import { Link } from "react-router-dom";

export default function AttractionsList() {
  const { currentDistrict, currentDistrictId } = useDistrict();
  const [attractions, setAttractions] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!currentDistrictId) return;
    const url = `/api/tourism/attractions?districtId=${currentDistrictId}${filter ? `&type=${filter}` : ""}`;
    fetch(url).then(r => r.json()).then(setAttractions).catch(() => {});
  }, [currentDistrictId, filter]);

  const types = ["natural", "cultural", "gastronomic", "adventure", "religious", "historical", "recreational"];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--md-text)" }}>Turismo — {currentDistrict}</h1>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        <button
          onClick={() => setFilter("")}
          className="btn-secondary"
          style={!filter ? { background: "var(--md-primary)", color: "#fff", borderColor: "var(--md-primary)" } : {}}
        >Todos</button>
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="btn-secondary"
            style={filter === t ? { background: "var(--md-primary)", color: "#fff", borderColor: "var(--md-primary)" } : {}}
          >{t}</button>
        ))}
      </div>
      <div className="space-y-3">
        {attractions.map((a: any) => (
          <Link key={a.id} to={`/turismo/${a.id}`} className="card block" style={{ padding: 16, display: "block" }}>
            {a.imageUrl && <img src={a.imageUrl} alt={a.name} className="w-full h-32 object-cover rounded mb-2" />}
            <h2 className="font-semibold" style={{ color: "var(--md-text)" }}>{a.name}</h2>
            <p className="text-sm" style={{ color: "var(--md-muted)" }}>{a.description?.slice(0, 100)}...</p>
            <span className="chip chip-info mt-1 inline-block">{a.attractionType}</span>
          </Link>
        ))}
        {attractions.length === 0 && <p style={{ color: "var(--md-muted)" }}>No hay atractivos turísticos registrados.</p>}
      </div>
    </div>
  );
}
