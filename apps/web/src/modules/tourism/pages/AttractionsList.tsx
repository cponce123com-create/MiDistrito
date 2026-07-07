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
      <h1 className="text-2xl font-bold mb-4">Turismo — {currentDistrict}</h1>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        <button onClick={() => setFilter("")} className={`px-3 py-1 rounded-full text-sm ${!filter ? "bg-blue-600" : "bg-gray-700"}`}>Todos</button>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1 rounded-full text-sm capitalize ${filter === t ? "bg-blue-600" : "bg-gray-700"}`}>{t}</button>
        ))}
      </div>
      <div className="space-y-3">
        {attractions.map((a: any) => (
          <Link key={a.id} to={`/turismo/${a.id}`} className="block p-3 bg-gray-800 rounded">
            {a.imageUrl && <img src={a.imageUrl} alt={a.name} className="w-full h-32 object-cover rounded mb-2" />}
            <h2 className="font-semibold">{a.name}</h2>
            <p className="text-sm text-gray-400">{a.description?.slice(0, 100)}...</p>
            <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded capitalize mt-1 inline-block">{a.attractionType}</span>
          </Link>
        ))}
        {attractions.length === 0 && <p className="text-gray-400">No hay atractivos turísticos registrados.</p>}
      </div>
    </div>
  );
}
