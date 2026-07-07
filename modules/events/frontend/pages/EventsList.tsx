import { useEffect, useState } from "react";
import { useDistrict } from "../../../../apps/web/src/core/DistrictContext";
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
      <h1 className="text-2xl font-bold mb-4">Eventos — {currentDistrict}</h1>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        <button onClick={() => setFilter("")} className={`px-3 py-1 rounded-full text-sm ${!filter ? "bg-blue-600" : "bg-gray-700"}`}>Todos</button>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1 rounded-full text-sm capitalize ${filter === c ? "bg-blue-600" : "bg-gray-700"}`}>{c}</button>
        ))}
      </div>
      <div className="space-y-3">
        {events.map((e: any) => (
          <Link key={e.id} to={`/eventos/${e.id}`} className="block p-3 bg-gray-800 rounded">
            {e.imageUrl && <img src={e.imageUrl} alt={e.title} className="w-full h-24 object-cover rounded mb-2" />}
            <div className="flex items-start gap-3">
              <div className="text-center min-w-[48px]">
                <div className="text-xl font-bold text-blue-400">{new Date(e.startDate).getDate()}</div>
                <div className="text-xs text-gray-400">{new Date(e.startDate).toLocaleDateString("es-PE", { month: "short" })}</div>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">{e.title}</h2>
                <p className="text-sm text-gray-400">{e.shortDescription?.slice(0, 80)}...</p>
                <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded capitalize mt-1 inline-block">{e.category}</span>
              </div>
            </div>
          </Link>
        ))}
        {events.length === 0 && <p className="text-gray-400">No hay eventos próximos.</p>}
      </div>
    </div>
  );
}
