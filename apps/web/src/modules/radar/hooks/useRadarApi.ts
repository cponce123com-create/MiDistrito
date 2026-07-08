import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDistrict } from '../../../core/DistrictContext';

// ---------------
// Helper fetch
// ---------------
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ---------------
// Types
// ---------------
export interface RadarStats {
  totalReports: number;
  activeAlerts: number;
  todayIncidents: number;
  resolvedToday: number;
  totalMissing: number;
  activeMissing: number;
  reportsByCategory: { category: string; count: number }[];
  reportsByStatus: { status: string; count: number }[];
  topSectors: { sector: string; count: number }[];
  weeklyTrend: { day: string; count: number }[];
  criticalZone: string;
}

export interface Report {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  urgency: string;
  latitude: number;
  longitude: number;
  address: string;
  sector: string;
  authorName: string;
  imageUrl: string | null;
  createdAt: string;
  confirmations: number;
}

export interface PanicAlert {
  id: number;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
  authorName: string;
  sector: string;
  isActive: boolean;
  createdAt: string;
}

export interface MissingPerson {
  id: number;
  name: string;
  age: number;
  clothing: string;
  lastSeenAddress: string;
  lastSeenLatitude: number;
  lastSeenLongitude: number;
  lastSeenDate: string;
  status: string;
  photoUrl: string | null;
  createdAt: string;
}

// ---------------
// Queries
// ---------------

/** Stats del dashboard */
export function useRadarStats() {
  const { currentDistrictId } = useDistrict();
  return useQuery({
    queryKey: ['radar', 'stats', currentDistrictId],
    queryFn: () => apiFetch<RadarStats>(`/api/radar/stats?districtId=${currentDistrictId}`),
    enabled: !!currentDistrictId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Lista paginada de reportes */
export function useReports(params?: {
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const { currentDistrictId } = useDistrict();
  const searchParams = new URLSearchParams({ districtId: String(currentDistrictId) });
  if (params?.category) searchParams.set('category', params.category);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));

  return useQuery({
    queryKey: ['radar', 'reports', currentDistrictId, params],
    queryFn: () =>
      apiFetch<{ reports: Report[]; total: number; limit: number; offset: number }>(
        `/api/radar/reports?${searchParams}`,
      ),
    enabled: !!currentDistrictId,
    staleTime: 15_000,
  });
}

/** Detalle de un reporte */
export function useReportDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: ['radar', 'report', id],
    queryFn: () => apiFetch<Report>(`/api/radar/reports/${id}`),
    enabled: !!id,
    staleTime: 10_000,
  });
}

/** Alertas de pánico activas */
export function usePanicAlerts() {
  const { currentDistrictId } = useDistrict();
  return useQuery({
    queryKey: ['radar', 'panic-alerts', currentDistrictId],
    queryFn: () =>
      apiFetch<{ alerts: PanicAlert[] }>(
        `/api/radar/panic-alerts?districtId=${currentDistrictId}&active=true`,
      ),
    enabled: !!currentDistrictId,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

/** Personas desaparecidas */
export function useMissingPersons() {
  const { currentDistrictId } = useDistrict();
  return useQuery({
    queryKey: ['radar', 'missing-persons', currentDistrictId],
    queryFn: () =>
      apiFetch<{ persons: MissingPerson[] }>(
        `/api/radar/missing-persons?districtId=${currentDistrictId}`,
      ),
    enabled: !!currentDistrictId,
    staleTime: 30_000,
  });
}

/** Categorías disponibles */
export function useReportCategories() {
  return useQuery({
    queryKey: ['radar', 'categories'],
    queryFn: () => apiFetch<{ id: number; name: string; slug: string }[]>('/api/radar/categories'),
    staleTime: 60_000,
  });
}

// ---------------
// Mutations
// ---------------

/** Confirmar un reporte (vecino confirma haberlo visto) */
export function useConfirmReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: number) =>
      apiFetch<{ success: boolean }>(`/api/radar/reports/${reportId}/confirm`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radar', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['radar', 'report'] });
      queryClient.invalidateQueries({ queryKey: ['radar', 'stats'] });
    },
  });
}

// ---------------
// Notification Types & Hooks
// ---------------

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

/** Lista de notificaciones del distrito actual */
export function useNotifications() {
  const { currentDistrictId } = useDistrict();
  return useQuery({
    queryKey: ['radar', 'notifications', currentDistrictId],
    queryFn: () =>
      apiFetch<{ notifications: Notification[]; total: number }>(
        `/api/radar/notifications?districtId=${currentDistrictId}`,
      ),
    enabled: !!currentDistrictId,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

/** Marcar una notificación como leída */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/radar/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radar', 'notifications'] });
    },
  });
}
