# ARQUITECTURA — MiDistrito Platform

> Versión: 1.0 | Fecha: 2026-07-07 | Estado: Aprobado

## ADR-001: Monolito modular con pnpm workspaces

**Contexto:** Necesitamos una arquitectura que soporte múltiples dominios (radar, news, marketplace, turismo) sin la complejidad operativa de microservicios.

**Decisión:** Monolito modular. Un solo backend (`apps/api`), un solo frontend (`apps/web`), organizados internamente en módulos que comparten un `lib/` común. Los módulos se comunican por llamadas directas a servicios o event-emitter en proceso.

**Consecuencias:**
- ✅ Despliegue simple (un solo proceso en Render)
- ✅ Menor latencia (sin red entre módulos)
- ✅ Código compartido (auth, DB, tipos) sin duplicación
- ⚠️ Escalamiento vertical (un solo proceso), pero suficiente para el alcance
- ❌ No aplica: Redis/BullMQ solo si algún día se necesita desacoplar workers pesados

## ADR-002: RadarVecinal como esqueleto base

**Contexto:** Cuatro proyectos existentes con stack similar. RadarVecinal es el más maduro: tiene auth completo, multi-distrito, Cloudinary, notificaciones, tests y estructura de monorepo pnpm.

**Decisión:** Tomar la estructura y el Core de RadarVecinal como base de MiDistrito. El módulo "radar" es simplemente lo que hoy es RadarVecinal (reportes, alertas, personas desaparecidas) reubicado en `modules/radar/`. El resto de Radar (auth, usuarios, distritos, archivos, notificaciones) pasa a ser el CORE compartido.

**Consecuencias:**
- ✅ Aprovechamos código probado y con tests
- ✅ Estructura de monorepo ya existente (pnpm workspaces)
- ✅ Auth robusto (JWT access + refresh, bloqueo progresivo, consentimiento Ley 29733)
- ✅ Multi-distrito ya implementado
- ⚠️ Migrar de `serial` a `UUID` queda pendiente para futura decisión

## ADR-003: Estructura de carpetas del monorepo

```
mi-distrito/
├── apps/
│   ├── api/                  # Backend Express — Core + módulos registrados
│   │   └── src/
│   │       ├── core/         # Auth, usuarios, distritos, archivos, notifs
│   │       ├── modules/      # Carga dinámica desde modules.config.ts
│   │       └── lib/          # Utilidades compartidas (cache, logger, etc.)
│   ├── web/                  # Frontend React + Vite + Tailwind + shadcn/ui
│   │   └── src/
│   │       ├── core/         # Auth context, layout, API client base
│   │       └── modules/      # Componentes/páginas por módulo
│   └── bot/                  # Worker del bot de noticias (Fase 2)
├── lib/                      # Librerías compartidas (workspaces)
│   ├── db/                   # Drizzle ORM — schema, migrations, conexión
│   ├── api-zod/              # Schemas Zod compartidos frontend/backend
│   ├── api-spec/             # OpenAPI spec + orval config
│   ├── api-client-react/     # React Query hooks generados
│   └── object-storage/       # Cloudinary facade
├── modules/                  # Contrato de módulo (ver ADR-004)
│   ├── radar/                # Portado desde RadarVecinal (reportes, alertas)
│   ├── news/                 # Placeholder — pendiente de portar
│   └── marketplace/          # Placeholder — pendiente de portar
├── docs/                     # ADRs, ERD, roadmap, inventario
└── _referencia/              # Temporal — se borra al portar cada módulo
```

## ADR-004: Contrato de módulo

Cada módulo es auto-contenido y sigue esta estructura:

```
modules/<module>/
├── backend/
│   ├── routes/               # Rutas Express (registradas automáticamente)
│   ├── services/             # Lógica de negocio
│   ├── schema/               # Tablas Drizzle (schema PG del módulo)
│   ├── permissions/          # Definición de permisos del módulo
│   ├── validators/           # Schemas Zod de input
│   └── events/               # Handlers de eventos internos
├── frontend/
│   ├── components/           # Componentes React
│   ├── pages/                # Páginas del módulo
│   ├── api/                  # Llamadas API específicas
│   ├── hooks/                # Hooks React
│   └── types/                # Tipos TypeScript del módulo
└── README.md                 # Documentación del módulo
```

**Reglas del contrato:**
1. Un módulo NO puede importar de otro módulo directamente
2. Un módulo puede importar de `@midistrito/core` (servicios compartidos)
3. Un módulo se comunica con otros módulos solo vía eventos (`events.emit`)
4. Un módulo se registra en `modules.config.ts` con su metadata (rutas, permisos, menú)

## ADR-005: Registro de módulos (modules.config.ts)

```typescript
// modules.config.ts
export const modules = [
  {
    id: 'radar',
    name: 'Radar Vecinal',
    enabled: true,
    routes: {
      backend: '/api/radar',
      frontend: '/radar',
    },
    permissions: [
      'report.create', 'report.read', 'report.update', 'report.delete',
      'alert.view', 'missing_person.create',
    ],
    menu: {
      icon: 'Radar',
      label: 'Radar Vecinal',
      order: 1,
    },
  },
  // Fase 2:
  // { id: 'news', ... },
  // Fase 3:
  // { id: 'marketplace', ... },
];
```

Agregar un nuevo módulo = agregar una entrada aquí. NO se tocan otros módulos.

## ADR-006: CORE (servicios compartidos)

El CORE vive en `apps/api/src/core/` y expone servicios que TODO módulo consume:

| Servicio | Responsabilidad |
|----------|----------------|
| `AuthService` | Register, login, refresh, JWT, rate limiting |
| `UserService` | CRUD usuarios, roles, perfil, DNI (RENIEC) |
| `DistrictService` | Catálogo de distritos, geocodificación, polígonos |
| `OrganizationService` | Municipalidades, comisarías, negocios |
| `FileService` | Fachada sobre Cloudinary (subir, eliminar, optimizar) |
| `NotificationService` | Interfaz unificada: push (FCM) + email (SMTP) + in-app |
| `SearchService` | Búsqueda full-text con PostgreSQL (pg_trgm) |
| `AuditService` | Registro de acciones con ip, usuario, target |
| `ConfigService` | Configuración global y por distrito |
| `EventEmitter` | Event-emitter en proceso para comunicación entre módulos |

## ADR-007: Base de datos — Nombres prefijados en schema `public`

Originalmente se planearon schemas PostgreSQL nativos (`core`, `radar`, `news`, `market`)
para separar dominios. Durante la implementación se optó por una convención más simple:
**schema `public` con nombres de tabla PREFIJADOS por dominio.**

Esta decisión se tomó porque:
- Drizzle maneja mejor el tipado con nombres planos que con `pgSchema`
- Las migraciones son más legibles sin calificar schemas
- Neon/PostgreSQL no da beneficio real de aislamiento con schemas separados cuando
  el multi-tenant se maneja en capa de aplicación

**Convención:**
```sql
core_*   → core_users, core_districts, core_notifications, etc.
radar_*  → radar_reports, radar_panic_alerts, radar_missing_persons, etc.
news_*   → news_articles, news_sources, news_categories, etc.  (Fase 2)
market_* → market_stores, market_products, market_orders, etc.  (Fase 3)
```

**En Drizzle:**
```typescript
import { pgTable, ... } from "drizzle-orm/pg-core";
export const usersTable = pgTable("core_users", { ... });
export const reportsTable = pgTable("radar_reports", { ... });
```

**Multi-distrito en capa de aplicación:**
- `district_id` es FK obligatorio en TODA tabla de negocio
- NO usamos RLS de PostgreSQL. Razón: Radar lo intentó y lo abandonó.
- La defensa es en capa de aplicación: toda query filtra por `districtId`.
- Un middleware `checkTenant` inyecta el filtro automáticamente.

## ADR-008: RBAC granular (permisos por acción)

NO usamos roles genéricos tipo "admin". Cada módulo define permisos específicos:

```
formato: <modulo>.<acción>
ejemplos: report.create, report.delete, store.create, news.publish
```

Los **roles** son agrupaciones predefinidas de permisos:

| Rol | Ámbito | Permisos incluidos |
|-----|--------|-------------------|
| `super_admin` | Global | Todos |
| `municipal` | Distrito | report.update, report.delete, report_messages.* |
| `vecino` | Distrito | report.create, report.read, alert.create |
| `viewer` | Distrito | Solo lectura de dashboard |
| `store_admin` | Tienda | store.*, product.*, order.* |
| `store_staff` | Tienda | product.read, order.read |

Los roles se definen en `core/permissions/roles.ts` y cada módulo registra sus permisos en `modules/<modulo>/backend/permissions/index.ts`.

## ADR-009: Eventos internos (event-emitter en proceso)

Usamos un `EventEmitter` nativo de Node.js para desacoplar reacciones entre módulos SIN infraestructura de colas.

```typescript
// apps/api/src/core/events.ts
import { EventEmitter } from 'events';
export const events = new EventEmitter();
events.setMaxListeners(50);

// Un módulo emite:
events.emit('report.created', { reportId: 123, districtId: 1 });

// El CORE reacciona:
events.on('report.created', async (data) => {
  await notificationService.notifyNearbyUsers(data);
  await auditService.log('report.created', data);
});
```

**Cuándo NO usar eventos:** Para flujos transaccionales que deben ser atómicos (ej: crear una venta y descontar stock), usar llamada directa al servicio.

## ADR-010: Búsqueda con PostgreSQL (sin motores externos)

Usamos `pg_trgm` para búsqueda full-text y fuzzy matching. NO ElasticSearch, Algolia, ni motores externos.

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_reports_title_trgm ON reports USING gin (title gin_trgm_ops);
```

Cada módulo expone su propio índice de búsqueda en su schema.

## ADR-011: Frontend SPA con React Router (no Next.js)

El frontend es una SPA con React + Vite, no Next.js. Razones:
- El backend ya es Express con API REST
- SEO no es crítico (app cívica, no blog público)
- simplicidad: un solo `vite build` → carpeta `dist/` servida estáticamente por Express

Para el bot de noticias (Fase 2) evaluaremos prerenderizado si es necesario.

## ADR-012: Política de dependencias

- NO agregar dependencias pesadas sin justificar y preguntar
- Preferir dependencias ya presentes en RadarVecinal (validadas)
- BullMQ/Redis: solo si hay workers pesados que justifiquen la cola
- pgvector: solo si el módulo news requiere búsqueda semántica (evaluar en Fase 2)

## ADR-013: Pull requests pequeños y frecuentes

Cada fase de portado:
1. Rama `feature/<modulo>-port`
2. Portar schema Drizzle (migración aditiva, nunca destructiva)
3. Portar backend (rutas + servicios)
4. Portar frontend (componentes + páginas)
5. Tests
6. Merge a `main` y borrar `_referencia/<modulo>` correspondiente

## ADR-014: Module loader — Estrategia dev/prod

El cargador de módulos (`core/moduleLoader.ts`) debe funcionar tanto en desarrollo
(.ts con tsx) como en producción (.js compilado en dist/).

**Estrategia:** `resolveModulePath()` prueba candidatos en orden:
1. `modules/<name>/backend/index.ts` — desarrollo con tsx
2. `modules/<name>/backend/dist/index.js` — módulos compilados individualmente
3. `dist/modules/<name>/backend/index.js` — build monolítico del monorepo

**En Render (producción):** El build script debe compilar los módulos habilitados.
Se recomienda un `pnpm build:modules` que ejecute `tsc` sobre cada módulo enabled,
o alternativamente usar `tsx` en producción si el free tier lo permite (es más
simple y evita duplicar config de compilación).
