// api-zod: Shared Zod schemas for MiDistrito API
// Estos schemas se generan desde api-spec y se consumen tanto
// desde apps/api (validación) como desde apps/web (types).
//
// Actualmente es un placeholder que exporta tipos base.
// La generación automatizada se integrará en Fase 2.

import { z } from "zod";

// ── Schemas base compartidos ───────────────────────────────────────────────

export const PaginationParams = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof PaginationParams>;

export const DateRangeParams = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type DateRangeParams = z.infer<typeof DateRangeParams>;

export const ApiSuccessResponse = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.literal(true),
    data,
  });

export const ApiErrorResponse = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponse>;
