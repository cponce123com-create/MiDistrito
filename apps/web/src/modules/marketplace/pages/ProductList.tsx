import { useEffect, useState } from "react";
import { useDistrict } from "../../../core/DistrictContext";

export default function ProductList() {
  const { currentDistrict, currentDistrictId } = useDistrict();
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    if (!currentDistrictId) return;
    fetch(`/api/marketplace/products?districtId=${currentDistrictId}`)
      .then(r => r.json()).then(setProducts).catch(() => {});
    fetch(`/api/marketplace/stores?districtId=${currentDistrictId}`)
      .then(r => r.json()).then(setStores).catch(() => {});
  }, [currentDistrictId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Marketplace — {currentDistrict}</h1>
      {/* Stores carousel */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Tiendas</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {stores.map((s: any) => (
            <div key={s.id} className="min-w-[140px] p-3 bg-gray-800 rounded flex-shrink-0">
              <p className="font-medium text-sm">{s.name}</p>
              <p className="text-xs text-gray-400">{s.businessType}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Products grid */}
      <div className="grid grid-cols-2 gap-3">
        {products.map((p: any) => (
          <div key={p.id} className="p-3 bg-gray-800 rounded">
            {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-24 object-cover rounded mb-2" />}
            <p className="font-medium text-sm">{p.name}</p>
            <p className="text-blue-400 font-bold">S/ {p.price}</p>
            {p.salePrice && <p className="text-green-400 text-xs">Oferta: S/ {p.salePrice}</p>}
            <p className="text-xs text-gray-500 mt-1">{p.unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
