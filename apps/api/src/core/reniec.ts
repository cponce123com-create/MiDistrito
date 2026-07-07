/**
 * reniec.ts — Consulta RENIEC (DNI → datos personales).
 * Servicio protegido del Core: requiere auth + rol backoffice + rate limit + cache.
 */
import { z } from "zod";
import { db } from "@midistrito/db";
import { auditLogsTable } from "@midistrito/db/schema";
import { eq } from "drizzle-orm";

// ── Cache en memoria ────────────────────────────────────────────────────────
const cache = new Map<string, { data: ReniecResponse; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

export interface ReniecResponse {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  codVerifica: string;
  success: boolean;
  error?: string;
}

const RENIEC_API_URL = process.env.RENIEC_API_URL || "https://api.reniec.com/v1";
const RENIEC_API_TOKEN = process.env.RENIEC_API_TOKEN;

/**
 * Consulta los datos de una persona por su DNI.
 * Solo accesible desde el backend (no expuesto como ruta directa sin middleware).
 */
export async function consultarDni(dni: string, userId: number): Promise<ReniecResponse> {
  // Validar formato DNI
  const parsed = z.string().length(8).regex(/^\d{8}$/).safeParse(dni);
  if (!parsed.success) {
    throw new Error("DNI debe tener 8 dígitos numéricos.");
  }

  // Verificar cache
  const cached = cache.get(dni);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  if (!RENIEC_API_TOKEN) {
    throw new Error("RENIEC_API_TOKEN no configurado. Consulta no disponible.");
  }

  // Consultar API externa
  const response = await fetch(`${RENIEC_API_URL}/persona/${dni}`, {
    headers: {
      Authorization: `Bearer ${RENIEC_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error RENIEC API: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as ReniecResponse;

  // Guardar en cache
  cache.set(dni, { data, expiresAt: Date.now() + CACHE_TTL_MS });

  // Auditar la consulta
  await db.insert(auditLogsTable).values({
    userId,
    action: "RENIEC_CONSULT",
    targetType: "DNI",
    targetId: parseInt(dni),
    newValue: { nombres: data.nombres },
    ip: "",
  });

  return data;
}

/**
 * Limpia el cache de RENIEC (útil para testing).
 */
export function clearReniecCache(): void {
  cache.clear();
}
