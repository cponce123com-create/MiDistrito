import { useQuery } from "@tanstack/react-query";
import { useDistrict } from "../../../core/DistrictContext";

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface NewsArticle {
  id: number;
  title: string;
  summary: string | null;
  body: string | null;
  author: string | null;
  images: string[] | null;
  categoryId: number | null;
  sourceId: number;
  url: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  fetchedAt: string;
}

export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface NewsSource {
  id: number;
  name: string;
  sourceType: string;
  isActive: boolean;
  feedUrl: string | null;
}

export function useArticles(params?: { limit?: number; offset?: number; categoryId?: number }) {
  const { currentDistrictId } = useDistrict();
  const sp = new URLSearchParams({ districtId: String(currentDistrictId) });
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));
  if (params?.categoryId) sp.set("categoryId", String(params.categoryId));
  return useQuery({
    queryKey: ["news", "articles", currentDistrictId, params],
    queryFn: () => apiFetch<{ articles: NewsArticle[]; total: number }>(`/api/news/articles?${sp}`),
    enabled: !!currentDistrictId,
    staleTime: 15000,
  });
}

export function useArticleDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: ["news", "article", id],
    queryFn: () => apiFetch<NewsArticle>(`/api/news/articles/${id}`),
    enabled: !!id,
    staleTime: 10000,
  });
}

export function useNewsCategories() {
  return useQuery({
    queryKey: ["news", "categories"],
    queryFn: () => apiFetch<NewsCategory[]>("/api/news/categories"),
    staleTime: 60000,
  });
}

export function useNewsSources() {
  const { currentDistrictId } = useDistrict();
  return useQuery({
    queryKey: ["news", "sources", currentDistrictId],
    queryFn: () => apiFetch<NewsSource[]>(`/api/news/sources?districtId=${currentDistrictId}`),
    enabled: !!currentDistrictId,
    staleTime: 30000,
  });
}
