import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function StoreDetail() {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/marketplace/stores/${id}`)
      .then(r => r.json())
      .then(setStore)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!store) {
    return <div className="p-4 text-center text-gray-400">Tienda no encontrada.</div>;
  }

  return (
    <div className="p-4">
      {/* Store header */}
      <div className="mb-6">
        {store.bannerUrl && (
          <img src={store.bannerUrl} alt="" className="w-full h-32 object-cover rounded-lg mb-3" />
        )}
        <div className="flex items-center gap-3">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold">
              {store.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{store.name}</h1>
            <p className="text-sm text-gray-400 capitalize">{store.businessType?.replace(/_/g, " ")}</p>
          </div>
        </div>
        {store.description && <p className="mt-2 text-sm text-gray-300">{store.description}</p>}
        {store.whatsapp && (
          <a
            href={`https://wa.me/${store.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded"
          >
            Contactar por WhatsApp
          </a>
        )}
      </div>

      {/* Products */}
      <h2 className="text-lg font-semibold mb-3">Productos</h2>
      {store.products?.length === 0 ? (
        <p className="text-gray-500 text-sm">Esta tienda aún no tiene productos.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {store.products?.map((p: any) => (
            <div key={p.id} className="p-3 bg-gray-800 rounded">
              {p.imageUrl && (
                <img src={p.imageUrl} alt={p.name} className="w-full h-24 object-cover rounded mb-2" />
              )}
              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-blue-400 font-bold">S/ {p.price}</p>
              {p.salePrice && <p className="text-green-400 text-xs">Oferta: S/ {p.salePrice}</p>}
              <p className="text-xs text-gray-500 mt-1">{p.unit}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
