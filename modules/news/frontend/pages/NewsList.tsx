import { useEffect, useState } from "react";
import { useAuth } from "../../../../apps/web/src/core/AuthContext";
import { useDistrict } from "../../../../apps/web/src/core/DistrictContext";

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Noticias — {currentDistrict}</h1>
      {articles.length === 0 ? (
        <p className="text-gray-400">No hay noticias aún.</p>
      ) : (
        <div className="space-y-3">
          {articles.map((a: any) => (
            <div key={a.id} className="p-3 bg-gray-800 rounded">
              <h2 className="font-semibold">{a.title}</h2>
              <p className="text-sm text-gray-400 mt-1">
                {a.summary?.slice(0, 150)}...
              </p>
              <div className="flex gap-2 mt-2 text-xs text-gray-500">
                <span>{a.author || "Sin autor"}</span>
                <span>•</span>
                <span className={`px-1.5 py-0.5 rounded ${
                  a.status === "published" ? "bg-green-900 text-green-300" :
                  a.status === "pending_approval" ? "bg-yellow-900 text-yellow-300" :
                  "bg-gray-700"
                }`}>{a.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {user && ["admin", "super_admin", "editor"].includes(user.role) && (
        <div className="mt-4 flex gap-2">
          <a href="/noticias/fuentes" className="px-3 py-1.5 bg-blue-600 rounded text-sm">Fuentes</a>
          <a href="/noticias/aprobar" className="px-3 py-1.5 bg-yellow-600 rounded text-sm">Aprobar</a>
        </div>
      )}
    </div>
  );
}
