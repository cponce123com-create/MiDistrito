# INVENTARIO — Análisis de repositorios de referencia

> Fecha: 2026-07-07 | Proyecto: MiDistrito

## Tabla comparativa

| Aspecto | RadarVecinal | Bot Noticias | Camila | Mercanto |
|---------|-------------|-------------|--------|----------|
| **Stack** | Node + Express 5 + TS + Drizzle | Python 3.11 + FastAPI + SQLAlchemy | Node + Express 5 + TS + Drizzle | Node + Express 5 + TS + Drizzle |
| **Package manager** | pnpm workspaces | pip/poetry (pyproject.toml) | pnpm workspaces | pnpm (monorepo simple) |
| **DB** | Neon PostgreSQL (Drizzle ORM) | PostgreSQL + pgvector (SQLAlchemy) | Neon PostgreSQL (Drizzle ORM) | Neon PostgreSQL (Drizzle ORM) |
| **Frontend** | React + Vite + Tailwind + shadcn/ui | React + Vite + Tailwind | React + Vite + Tailwind + shadcn/ui | React + Vite + Tailwind + shadcn/ui |
| **Auth** | JWT (access 15m + refresh 30d), bcryptjs | JWT (python-jose), passlib/bcrypt | pbkdf2 custom + sesiones en DB | JWT en cookie, bcryptjs |
| **Multi-distrito** | ✅ Sí (district_id FK obligatorio) | ❌ No | ❌ No (district solo texto) | ❌ No (district solo texto) |
| **IDs** | serial (auto-increment) | UUID v4 | UUID v4 (text) | serial (auto-increment) |
| **Cloudinary** | ✅ Sí | ✅ Sí | ❌ No | ✅ Sí |
| **Notificaciones** | ✅ FCM + SMTP + SSE | ❌ Solo Telegram | ❌ No | ✅ Email simple |
| **Auditoría** | ✅ audit_logs | ❌ No | ✅ audit_logs | ❌ No |
| **Deploy** | Render (free) | Render + Docker | Render (free) | Render (free) |
| **Tests** | ✅ Vitest + supertest | ✅ pytest | ❌ No | ❌ No |

## Estructura de carpetas

### RadarVecinal (esqueleto base)

```
radar-vecinal/
├── artifacts/
│   ├── api-server/          # Backend Express
│   │   └── src/
│   │       ├── routes/      # auth, reports, alerts, users, etc.
│   │       ├── middlewares/  # audit
│   │       ├── lib/         # email, fcm, storage, cache, swagger, license
│   │       └── workers/     # emailWorker, reportWorker
│   └── radar-vecinal/       # Frontend React
│       └── src/
│           ├── components/  # UI (shadcn) + feature components
│           ├── pages/       # Home, Admin, Alerts, Map, etc.
│           ├── contexts/    # AuthContext, DistrictContext
│           ├── hooks/       # useGeolocation, usePanicAlertStream, etc.
│           └── lib/         # apiConfig, utils, offlineSync
├── lib/
│   ├── db/                  # Drizzle schema + migrations
│   │   └── src/schema/      # reports, auditLogs
│   ├── api-spec/            # OpenAPI + orval
│   ├── api-client-react/    # React client SDK
│   ├── api-zod/             # Zod schemas compartidos
│   └── object-storage-web/  # Cloudinary facade
└── scripts/                 # seed, utilidades
```

### Bot Noticias (Python - stack distinto)

```
bot-noticias/
├── backend/app/             # FastAPI
│   ├── api/v1/              # auth, news, sources, categories, etc.
│   ├── core/                # database, security, filters, redis
│   ├── models/              # SQLAlchemy models: user, news, source, etc.
│   ├── schemas/             # Pydantic schemas
│   └── services/            # news_service, source_service, etc.
├── workers/                 # pipeline, scrapers, publishers, scheduler
├── database/                # init.sql + migrations
├── frontend/                # React + Vite
└── config/                  # filters.yaml, sources/
```

### Camila (marketplace - Node)

```
camila/
├── artifacts/
│   ├── api-server/          # Backend Express
│   │   └── src/
│   │       ├── routes/      # auth, stores, products, sales, restaurant, etc.
│   │       └── lib/         # auth (pbkdf2), email, seed, swagger
│   └── camila/              # Frontend React
└── lib/
    └── db/src/schema/       # 26 tablas: users, stores, products, licenses, etc.
```

### Mercanto (marketplace - Node, más simple)

```
mercanto/
├── artifacts/
│   ├── api-server/          # Backend Express
│   │   └── src/
│   │       ├── routes/      # auth, stores, products, offers, reviews, etc.
│   │       └── services/    # cloudinary, email
│   └── mercanto/            # Frontend React
└── lib/
    └── db/src/schema/       # users, stores, products, categories, etc.
```

## Modelo de datos — Tablas por repositorio

### RadarVecinal (10 tablas)

| Tabla | Propósito |
|-------|-----------|
| `users` | Usuarios con roles, districtId, vecinoId, trustScore |
| `districts` | Catálogo oficial de distritos (multi-tenant) |
| `reports` | Reportes ciudadanos con categoría, urgencia, ubicación |
| `panic_alerts` | Alertas de pánico en tiempo real |
| `missing_persons` | Denuncias de personas desaparecidas |
| `ad_slots` | Espacios publicitarios por distrito |
| `notifications` | Notificaciones push/in-app |
| `report_messages` | Hilo de comunicación vecino ↔ admin |
| `licenses` | Licencias para municipalidades |
| `audit_logs` | Registro de auditoría de acciones admin |
| `categories` | Categorías dinámicas de reportes |
| `departments` | Departamentos municipales |
| `refresh_tokens` | Refresh tokens JWT |
| `user_consents` | Consentimiento de datos personales (Ley 29733) |

### Bot Noticias (11 tablas)

| Tabla | Propósito |
|-------|-----------|
| `users` | Usuarios del sistema (admin, editor, moderator) |
| `categories` | Categorías de noticias |
| `sources` | Fuentes RSS, web, Telegram |
| `news` | Artículos de noticias agregados |
| `telegram_channels` | Canales de Telegram para publicación |
| `publication_logs` | Historial de publicaciones |
| `approval_queue` | Cola de aprobación de noticias |
| `scraper_logs` | Logs de scraping |
| `system_config` | Configuración del sistema |
| `analytics_events` | Eventos de analítica |
| `filters` | Filtros de contenido |

### Camila (26 tablas)

| Tabla | Propósito |
|-------|-----------|
| `users` | Dueños/staff de tiendas (store_admin, cashier) |
| `stores` | Tiendas con datos fiscales (RUC/DNI) |
| `categories` | Categorías de productos |
| `products` | Productos con precio, stock, variantes |
| `product_variants` | Variantes (talla, color) |
| `product_reviews` | Reseñas de productos |
| `product_images` | Imágenes de productos |
| `inventory` | Movimientos de inventario |
| `store_banners` | Banners de tienda |
| `store_settings` | Configuración por tienda |
| `clients` | Clientes registrados |
| `sales` | Ventas |
| `sale_items` | Items de venta |
| `sessions` | Sesiones de usuario |
| `licenses` | Licencias del sistema |
| `license_history` | Historial de licencias |
| `license_codes` | Códigos canjeables |
| `restaurant_tables` | Mesas de restaurante |
| `restaurant_orders` | Pedidos de restaurante |
| `restaurant_order_items` | Items de pedido |
| `daily_menus` | Menús del día |
| `daily_menu_items` | Items del menú |
| `support_tickets` | Tickets de soporte |
| `announcements` | Anuncios del sistema |
| `audit_logs` | Auditoría |
| `...` | (26 tablas en total) |

### Mercanto (aprox. 12 tablas)

| Tabla | Propósito |
|-------|-----------|
| `users` | Usuarios (vendedores/compradores) |
| `stores` | Tiendas con ubicación y horarios |
| `categories` | Categorías de productos |
| `products` | Productos con fotos, precios, ofertas |
| `offers` | Ofertas especiales |
| `reviews` | Reseñas de productos |
| `banners` | Banners promocionales |
| `favorites` | Productos favoritos |
| `search_history` | Historial de búsquedas |
| `store_visits` | Visitas a tiendas |
| `password_resets` | Reseteo de contraseñas |

## Gestión de usuarios y auth — Comparativa crítica

| Aspecto | RadarVecinal | Bot Noticias | Camila | Mercanto |
|---------|-------------|-------------|--------|----------|
| **Tabla users** | `users` con districtId, role, vecinoId, trustScore, loginAttempts | `users` con role, telegram_id | `users` con storeId, role (store_admin) | `users` con district (text), dni verificacion |
| **Hash** | bcryptjs (10 rounds) | passlib/bcrypt | pbkdf2 (propio) | bcryptjs (10 rounds) |
| **JWT** | access (15m) + refresh (30d) en DB | JWT (python-jose) | No JWT (sesiones en DB) | JWT en cookie (30d) |
| **Roles** | admin, moderator, user, super_admin, municipal, viewer | admin, editor, moderator | superadmin, store_admin, store_staff, cashier | user, admin |
| **Multi-tenant** | ✅ districtId obligatorio | ❌ | ❌ | ❌ |
| **Refresh tokens** | ✅ En tabla refresh_tokens con hash | ❌ | ❌ | ❌ (cookie sola) |
| **Rate limiting** | ✅ Por endpoint, aware de auth | ✅ slowapi | ❌ | ✅ authLimiter |
| **Bloqueo progresivo** | ✅ 5 intentos → 15 min lock | ❌ | ❌ | ❌ |
| **Consentimiento datos** | ✅ Ley 29733 | ❌ | ❌ | ❌ |

## Integraciones existentes

| Integración | Radar | Bot | Camila | Mercanto |
|-------------|-------|-----|--------|----------|
| Cloudinary | ✅ | ✅ | ❌ | ✅ |
| FCM (push) | ✅ | ❌ | ❌ | ❌ |
| SMTP Email | ✅ (nodemailer) | ❌ | ✅ (Resend) | ✅ (simple) |
| RENIEC DNI | ✅ | ❌ | ❌ | ❌ |
| Telegram | ❌ | ✅ (python-telegram-bot + Telethon) | ❌ | ❌ |
| SSE (streaming) | ✅ | ❌ | ❌ | ❌ |
| Swagger/OpenAPI | ✅ | ❌ | ✅ | ❌ |
| PDF (pdfkit) | ✅ | ❌ | ❌ | ❌ |
| BullMQ (Redis) | ✅ (reportWorker) | ❌ | ❌ | ❌ |
| WordPress | ❌ | ✅ | ❌ | ❌ |

---

## Conflictos a resolver

### 1. Modelo de usuarios TRIPLE
- **Radar**: `users` con districtId, vecinoId, trustScore, roles cívicos (admin, municipal, user), loginAttempts
- **Camila**: `users` con storeId, roles comerciales (store_admin, cashier) — NO tiene districtId
- **Mercanto**: `users` con district (texto), dniNumber, identityVerified, isBlocked
- **Solución**: Unificar en una sola tabla `users` que combine todos los campos, con districtId obligatorio y storeId opcional. Roles separados por ámbito (cívico vs comercial).

### 2. Sistema de IDs divergente
- Radar y Mercanto: `serial` (auto-increment integer)
- Camila: `text` con `crypto.randomUUID()`
- Bot Noticias: `UUID` nativo de PostgreSQL
- **Solución**: Adoptar `serial` de Radar por ser el esqueleto base. Si se necesita UUID en el futuro, migrar todas las tablas juntas.

### 3. Estrategia de auth incompatible
- Radar: JWT access (15m) + refresh token (30d) almacenado como hash en DB
- Camila: pbkdf2 propio + sesiones en tabla `sessions` (sin JWT)
- Mercanto: JWT simple en cookie httpOnly (sin refresh token)
- **Solución**: Adoptar el sistema de Radar (el más robusto): JWT access + refresh tokens con hash en DB, bcryptjs, bloqueo progresivo. Las sesiones de Camila y cookies de Mercanto se descartan.

### 4. Stack del Bot Noticias (Python vs Node)
- Bot Noticias está en FastAPI/Python, el resto del stack es Node/TypeScript.
- **Solución**: Portar el módulo "news" a TypeScript con Express + Drizzle, manteniendo la lógica de scraping y publicación. No convivir con Python en el mismo monorepo.

### 5. Marketplace duplicado (Camila y Mercanto)
- Camila tiene 26 tablas con restaurant, inventario, licencias, multi-tienda
- Mercanto tiene ~12 tablas con ofertas, reseñas, favoritos, mapa
- **Solución**: Fusionar ambos en un solo módulo "marketplace" tomando lo mejor de cada uno. Camila aporta el modelo de tiendas con RUC/DNI y restaurant; Mercanto aporta ofertas, reseñas, favoritos y mapa.

### 6. Multi-distrito
- Solo Radar tiene multi-distrito real con `districtId` FK y catálogo `districts`
- Camila y Mercanto tienen `district` como texto libre
- **Solución**: Toda tabla de negocio en MiDistrito tendrá `districtId` obligatorio. Durante el porteo, migrar datos de texto a IDs del catálogo.

### 7. Dependencias compartidas
- Todos los proyectos usan Express 5, Drizzle, Zod, bcryptjs, pero con versiones distintas
- Camila añade bulma, chart.js, framer-motion, lucide-react
- **Solución**: Catalog de versiones en pnpm-workspace.yaml (heredado de Radar). Cada módulo declara sus dependencias específicas.

### 8. Pruebas
- Solo Radar tiene tests (unit + integration)
- Camila y Mercanto no tienen
- **Solución**: Estandarizar con Vitest + supertest para todos los módulos futuros.
