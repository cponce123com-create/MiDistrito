import { useEffect, useState } from "react";
import { useAuth } from "../../../core/AuthContext";
import { useDistrict } from "../../../core/DistrictContext";

export default function Sources() {
  const { user } = useAuth();
  const { currentDistrictId } = useDistrict();
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    if (!currentDistrictId) return;
    fetch(`/api/news/sources?districtId=${currentDistrictId}`, { credentials: "include" })
      .then((r) => r.json())
      .then(setSources)
      .catch(() => {});
  }, [currentDistrictId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Fuentes de noticias</h1>
      {sources.length === 0 ? (
        <p className="text-gray-400">No hay fuentes configuradas.</p>
      ) : (
        <div className="space-y-2">
          {sources.map((s: any) => (
            <div key={s.id} className="p-3 bg-gray-800 rounded flex justify-between items-center">
              <div>
                <span className="font-medium">{s.name}</span>
                <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-700 rounded">{s.sourceType}</span>
              </div>
              <span className={`text-xs ${s.isActive ? "text-green-400" : "text-red-400"}`}>
                {s.isActive ? "Activa" : "Inactiva"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
