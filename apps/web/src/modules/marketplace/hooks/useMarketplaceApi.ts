import { useQuery } from "@tanstack/react-query";
import { useDistrict } from "../../../core/DistrictContext";

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  businessType: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  isActive: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  unit: string;
  stock: number | null;
  categoryId: number | null;
  tags: string[] | null;
  storeName?: string;
}

export interface MarketCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  isActive: boolean;
}

export function useStores() {
  const { currentDistrictId } = useDistrict();
  return useQuery({
    queryKey: ["marketplace", "stores", currentDistrictId],
    queryFn: () => apiFetch<Store[]>(`/api/marketplace/stores?districtId=${currentDistrictId}`),
    enabled: !!currentDistrictId,
    staleTime: 30000,
  });
}

export function useStoreDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["marketplace", "store", id],
    queryFn: () => apiFetch<Store & { products: Product[] }>(`/api/marketplace/stores/${id}`),
    enabled: !!id,
    staleTime: 15000,
  });
}

export function useProducts(params?: { categoryId?: number }) {
  const { currentDistrictId } = useDistrict();
  const sp = new URLSearchParams({ districtId: String(currentDistrictId) });
  if (params?.categoryId) sp.set("categoryId", String(params.categoryId));
  return useQuery({
    queryKey: ["marketplace", "products", currentDistrictId, params],
    queryFn: () => apiFetch<Product[]>(`/api/marketplace/products?${sp}`),
    enabled: !!currentDistrictId,
    staleTime: 15000,
  });
}

export function useMarketCategories() {
  return useQuery({
    queryKey: ["marketplace", "categories"],
    queryFn: () => apiFetch<MarketCategory[]>("/api/marketplace/categories"),
    staleTime: 60000,
  });
}
