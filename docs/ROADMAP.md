# ROADMAP — Plan de portado por fases

> Estrategia incremental: un módulo a la vez, migraciones aditivas, sin tocar datos reales hasta aprobación.

## Fase 0: Arquitectura base ← ESTAMOS AQUÍ

**Objetivo:** Monorepo compilando con Core + módulo radar portado estructuralmente.

**Entregables:**
- [x] `_referencia/` con los 4 repos clonados
- [x] `docs/INVENTORY.md` — Análisis de los 4 repos
- [x] `docs/ARCHITECTURE.md` — ADRs de arquitectura
- [x] `docs/ERD.md` — Modelo de datos unificado
- [x] `docs/ROADMAP.md` — Este documento
- [ ] `apps/api/` — Esqueleto del backend con Core + módulo radar
- [ ] `apps/web/` — Esqueleto del frontend
- [ ] `lib/db/` — Schemas Drizzle del Core unificado
- [ ] `modules.config.ts` — Registro de módulos
- [ ] `.env.example` consolidado
- [ ] `README.md` raíz

**Qué se copia de `_referencia/radar`:**
- `lib/db/` → Schemas Drizzle (adaptados a esquemas PG: core + radar)
- `lib/api-zod/`, `lib/api-spec/`, `lib/api-client-react/`, `lib/object-storage/` → Librerías compartidas
- `artifacts/api-server/` → `apps/api/` (Core: auth, users, districts, notifications)
- `artifacts/radar-vecinal/` → `apps/web/` (Frontend base)
- `scripts/` → Utilidades
- `pnpm-workspace.yaml`, `tsconfig.base.json`, `.npmrc`, `render.yaml` → Config raíz

**No se porta aún:** Lógica de negocio del módulo radar (reportes, alertas). Solo estructura.

---

## Fase 1: Portar módulo radar (completo)

**Objetivo:** El módulo radar funciona en la nueva arquitectura.

**Qué copiar de `_referencia/radar`:**
1. **Backend:** `routes/reports.ts`, `routes/alerts.ts`, `routes/activity.ts`, `routes/clearDemo.ts`, `routes/categories.ts`, `routes/civicEducation.ts`, `routes/embed.ts`, `routes/features.ts`, `routes/licenses.ts`, `routes/messages.ts`, `routes/reportsPdf.ts`, `routes/stats.ts`, `routes/storage.ts`, `routes/tenant.ts`, `routes/users.ts` → `modules/radar/backend/routes/`
2. **Frontend:** Páginas y componentes de radar (ReportCard, PanicModal, LeafletMap, etc.) → `modules/radar/frontend/`
3. **Servicios:** `workers/` (emailWorker, reportWorker) evaluar si van a Core o al módulo
4. **Tests:** Unitarios y de integración del módulo
5. **Migraciones Drizzle** del schema radar

**Qué se borra de `_referencia`:**
- `_referencia/radar/` completa

**Duración estimada:** 2-3 sprints

---

## Fase 2: Portar módulo news + bot directorio

**Objetivo:** Módulo de noticias (portado desde bot_noticias) operativo.

**Stack:** El bot_noticias está en Python/FastAPI. NO se porta como Python. Se reescribe en TypeScript + Express + Drizzle dentro del mismo monorepo.

**Qué copiar de `_referencia/bot-noticias` (como referencia, no como código):**
1. **Modelo de datos:** Adaptar tablas `sources`, `news`, `categories`, `telegram_channels`, `publication_logs`, `approval_queue` a Drizzle + schema PG `news`
2. **Lógica de scraping:** Portar `workers/scrapers/rss_scraper.py`, `workers/scrapers/telegram_scraper.py` a TypeScript
3. **Lógica de publicación:** Portar `workers/publishers/telegram_publisher.py` 
4. **Frontend:** Portar páginas de noticias del frontend React existente
5. **Bot Telegram:** Crear worker independiente en `apps/bot/` (proceso separado o en el mismo)

**Integraciones a migrar:**
- De `python-telegram-bot` a `grammy` (librería Telegram Bot para Node)
- De `SQLAlchemy` a `Drizzle ORM`
- De `apscheduler` a `node-cron` o bullMQ si justifica

**Qué se borra de `_referencia`:**
- `_referencia/bot-noticias/` completa

**Duración estimada:** 3-4 sprints

---

## Fase 3: Fusionar Camila + Mercanto → módulo marketplace

**Objetivo:** Marketplace unificado (lo mejor de Camila y Mercanto).

**Estrategia:** No portar ambos por separado. Diseñar un schema unificado (`market`) e implementar una sola vez.

**Qué tomar de `_referencia/camila`:**
- Modelo de tiendas con datos fiscales (RUC/DNI, document_type)
- Restaurant: mesas, pedidos, menús del día
- Productos con variantes (talla, color)
- Inventario y stock
- Licencias del sistema (códigos canjeables)
- Clientes registrados

**Qué tomar de `_referencia/mercanto`:**
- Mapa con Leaflet + geolocalización de tiendas
- Ofertas y descuentos
- Reseñas y favoritos
- Búsqueda full-text
- Verificación de identidad (DNI)
- Notificaciones email

**Qué diseñar nuevo:**
- Unificación de la tabla `users` con roles comerciales (`store_admin`, `store_staff`, `cashier`)
- Integración district_id en todas las tablas
- Middleware de tenant para marketplace

**Qué se borra de `_referencia`:**
- `_referencia/camila/` completa
- `_referencia/mercanto/` completa

**Duración estimada:** 4-5 sprints

---

## Fase 4: Módulos adicionales (turismo, eventos, empleos)

**Objetivo:** Expandir la plataforma con módulos no existentes en los repos actuales.

**Qué hacer:**
- Diseñar schema para cada nuevo módulo siguiendo el contrato (ADR-004)
- Implementar backend y frontend desde cero
- Reutilizar Core existente (auth, archivos, notificaciones, búsqueda)
- Cada módulo en rama independiente

**Posibles módulos:**
- `turismo` — Directorio de atractivos turísticos por distrito
- `eventos` — Calendario de eventos cívicos y culturales
- `empleos` — Bolsa de trabajo local
- `directorio` — Directorio de servicios (médicos, talleres, etc.)

**Duración estimada:** 2-3 sprints por módulo

---

## Criterios de completitud por fase

Cada fase se considera completa cuando:
1. ✅ El módulo compila sin errores de TypeScript
2. ✅ Las migraciones Drizzle son aditivas (no destructivas)
3. ✅ Las rutas backend responden con datos correctos
4. ✅ El frontend del módulo se renderiza en la SPA
5. ✅ Los tests del módulo pasan (unitarios + integración)
6. ✅ El multi-distrito funciona (cada usuario ve solo su distrito)
7. ✅ Se ha borrado la referencia correspondiente de `_referencia/`

## Diagrama de dependencias entre fases

```
Fase 0 ──→ Fase 1 ──→ Fase 2 ──→ Fase 3 ──→ Fase 4
(arquitectura)  (radar)    (news)     (marketplace) (turismo/eventos/empleos)
                    │           │            │
                    └── Core ───┴──── Core ──┘
                    (auth, distritos, archivos, notificaciones, eventos, auditoría)
```

Cada fase construye sobre el Core. El Core evoluciona con cada fase pero de manera compatible hacia atrás.
