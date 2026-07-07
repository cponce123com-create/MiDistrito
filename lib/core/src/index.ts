/**
 * @midistrito/core — Re-exporta servicios del Core de apps/api.
 * Los módulos importan desde aquí en vez de rutas relativas profundas.
 */
export { events, type MiDistritoEvents } from "../../../apps/api/src/core/events";
export {
  requireAuth,
  optionalAuth,
  requireAdmin,
  requireBackoffice,
  requireMunicipal,
  requireViewerOrAbove,
} from "../../../apps/api/src/core/auth";
