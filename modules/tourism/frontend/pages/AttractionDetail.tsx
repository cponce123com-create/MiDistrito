import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function AttractionDetail() {
  const { id } = useParams();
  const [attraction, setAttraction] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/tourism/attractions/${id}`).then(r => r.json()).then(setAttraction).catch(() => {});
  }, [id]);

  if (!attraction) return <div className="p-4 text-gray-400">Cargando...</div>;

  return (
    <div className="p-4">
      {attraction.imageUrl && <img src={attraction.imageUrl} alt={attraction.name} className="w-full h-48 object-cover rounded mb-4" />}
      <h1 className="text-2xl font-bold mb-2">{attraction.name}</h1>
      <span className="text-xs px-2 py-1 bg-blue-900 text-blue-300 rounded capitalize">{attraction.attractionType}</span>
      <p className="mt-4 text-gray-300">{attraction.description}</p>
      {attraction.schedule && <p className="mt-2"><span className="text-gray-400">Horario:</span> {attraction.schedule}</p>}
      {attraction.entryFee && <p className="mt-1"><span className="text-gray-400">Entrada:</span> {attraction.entryFee}</p>}
      {attraction.address && <p className="mt-1"><span className="text-gray-400">Dirección:</span> {attraction.address}</p>}
      {attraction.phone && <p className="mt-1"><span className="text-gray-400">Teléfono:</span> {attraction.phone}</p>}
      {attraction.website && <p className="mt-1"><a href={attraction.website} className="text-blue-400 underline">Sitio web</a></p>}
      {attraction.howToGetThere && <div className="mt-4"><h3 className="font-semibold">Cómo llegar</h3><p className="text-gray-300 text-sm">{attraction.howToGetThere}</p></div>}
      {attraction.tips && <div className="mt-4"><h3 className="font-semibold">Recomendaciones</h3><p className="text-gray-300 text-sm">{attraction.tips}</p></div>}
      {attraction.reviews?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Reseñas</h3>
          {attraction.reviews.map((r: any) => (
            <div key={r.id} className="p-2 bg-gray-800 rounded mb-2">
              <div className="flex items-center gap-1 mb-1">{Array.from({ length: r.rating }).map((_, i) => <span key={i}>⭐</span>)}</div>
              <p className="text-sm text-gray-300">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
