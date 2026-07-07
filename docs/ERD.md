# ERD — Modelo de datos unificado MiDistrito

> Schemas PostgreSQL por dominio: todos en schema `public` con prefijo (`core_`, `radar_`, `news_`, `market_`)

## Schema `core` — Tablas compartidas

### `core_users` — Tabla de usuarios ÚNICA (unificada)

```sql
-- Roles combinados de Radar (cívico), Camila (comercial) y Mercanto (verificado)
CREATE TYPE core_user_role AS ENUM (
  'super_admin',     -- Global (Radar super_admin)
  'municipal',       -- Municipalidad por distrito (Radar municipal)
  'moderator',       -- Moderador por distrito (Radar moderator)
  'viewer',          -- Solo lectura dashboard (Radar viewer)
  'vecino',          -- Ciudadano regular (Radar user)
  'store_admin',     -- Dueño de tienda (Camila store_admin)
  'store_staff',     -- Empleado de tienda (Camila store_staff)
  'cashier'          -- Cajero (Camila cashier)
);
```

| Columna | Tipo | Fuente | Notas |
|---------|------|--------|-------|
| `id` | `serial PK` | Radar | |
| `email` | `text UNIQUE NOT NULL` | Todos | Normalizado a lowercase |
| `password_hash` | `text` | Radar (bcrypt) | Nullable para OAuth futuro |
| `name` | `text NOT NULL` | Todos | |
| `first_name` | `text DEFAULT ''` | Radar | |
| `last_name` | `text DEFAULT ''` | Radar | |
| `role` | `user_role NOT NULL DEFAULT 'vecino'` | Unificado | |
| `district_id` | `integer FK → core.districts.id NOT NULL` | Radar | **Obligatorio** — multi-tenant |
| `dni` | `text UNIQUE` | Radar/Mercanto | |
| `phone` | `text` | Radar/Mercanto | |
| `is_active` | `boolean DEFAULT true` | Todos | |
| `is_blocked` | `boolean DEFAULT false` | Mercanto | Bloqueo manual por admin |
| `banned_at` | `timestamp` | Radar | |
| `ban_reason` | `text` | Radar | |
| `identity_verified` | `boolean DEFAULT false` | Mercanto | Verificación DNI |
| `identity_rejected_reason` | `text` | Mercanto | |
| `dni_front_url` / `dni_back_url` | `text` | Mercanto | Fotos del DNI |
| `avatar_url` | `text` | Mercanto | |
| `sector` | `text DEFAULT ''` | Radar | Zona del distrito |
| `vecino_id` | `integer UNIQUE` | Radar | ID público de 6 dígitos |
| `alias` | `text` | Radar | Nombre en clave del vecino |
| `display_name` | `text` | Radar | Nombre real para visores |
| `trust_score` | `integer DEFAULT 50` | Radar | 0-100 |
| `helpful_reports` | `integer DEFAULT 0` | Radar | |
| `reports_count` | `integer DEFAULT 0` | Radar | |
| `login_attempts` | `integer DEFAULT 0` | Radar | Bloqueo progresivo |
| `locked_until` | `timestamp` | Radar | |
| `suspended_until` | `timestamp` | Radar | |
| `store_id` | `text FK → market.stores.id` | Camila | **Opcional** — solo para roles comerciales |
| `created_at` | `timestamp DEFAULT now()` | Todos | |
| `updated_at` | `timestamp DEFAULT now()` | Mercanto | |

### `core_districts` — Catálogo de distritos

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `serial PK` | |
| `slug` | `text UNIQUE NOT NULL` | `san-ramon` |
| `name` | `text NOT NULL` | `San Ramón` |
| `province` | `text NOT NULL` | `Chanchamayo` |
| `department` | `text NOT NULL` | `Junín` |
| `center_lat` | `real` | Centro del distrito |
| `center_lng` | `real` | |
| `default_zoom` | `integer DEFAULT 15` | |
| `boundary` | `jsonb` | GeoJSON Polygon |
| `is_active` | `boolean DEFAULT true` | |
| `created_at` | `timestamp` | |

### `core_organizations` — Organizaciones (municipalidades, comisarías)

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `serial PK` | |
| `type` | `text NOT NULL` | `municipality`, `police`, `business` |
| `name` | `text NOT NULL` | |
| `district_id` | `integer FK → core.districts` | |
| `is_active` | `boolean DEFAULT true` | |
| `created_at` | `timestamp` | |

### `core_refresh_tokens`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `serial PK` | |
| `user_id` | `integer FK → core.users NOT NULL` | |
| `token_hash` | `text NOT NULL` | SHA-256 del token raw |
| `revoked` | `boolean DEFAULT false` | |
| `expires_at` | `timestamp NOT NULL` | 30 días |
| `created_at` | `timestamp DEFAULT now()` | |

### `core_user_consents` — Ley 29733

| Columna | Tipo |
|---------|------|
| `id` | `serial PK` |
| `user_id` | `integer FK → core.users NOT NULL` |
| `type` | `text NOT NULL` (`privacy_policy`) |
| `version` | `text NOT NULL` |
| `ip_address` | `text` |
| `user_agent` | `text` |
| `created_at` | `timestamp DEFAULT now()` |

### `core_notifications`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `serial PK` | |
| `district_id` | `integer FK → core.districts NOT NULL` | |
| `user_id` | `integer FK → core.users` | NULL = notificación broadcast |
| `type` | `text NOT NULL` | `system`, `panic_alert`, `report_update`, etc. |
| `title` | `text NOT NULL` | |
| `body` | `text NOT NULL` | |
| `reference_id` | `text` | ID del recurso relacionado |
| `reference_type` | `text` | `report`, `alert`, `order` |
| `is_read` | `boolean DEFAULT false` | |
| `created_at` | `timestamp DEFAULT now()` | |

### `core_audit_logs`

| Columna | Tipo |
|---------|------|
| `id` | `uuid PK DEFAULT gen_random_uuid()` |
| `user_id` | `integer NOT NULL` |
| `action` | `text NOT NULL` |
| `target_type` | `text NOT NULL` |
| `target_id` | `integer NOT NULL` |
| `old_value` | `jsonb` |
| `new_value` | `jsonb` |
| `ip` | `text` |
| `created_at` | `timestamp DEFAULT now()` |

---

## Schema `radar` — Módulo Radar Vecinal

Todas las tablas tienen `district_id FK → core.districts` obligatorio.

### `radar_reports`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `serial PK` | |
| `title` | `text NOT NULL` | |
| `description` | `text NOT NULL` | |
| `category` | `text NOT NULL` | `robbery`, `fire`, etc. |
| `urgency` | `text NOT NULL` | `low`/`medium`/`high`/`critical` |
| `status` | `text DEFAULT 'active'` | `active`/`reviewing`/`resolved`/`archived` |
| `is_anonymous` | `boolean DEFAULT false` | |
| `latitude` / `longitude` | `real NOT NULL` | |
| `address` | `text` | |
| `sector` | `text` | |
| `district_id` | `integer FK → core.districts NOT NULL` | |
| `image_url` | `text` | Cloudinary |
| `author_user_id` | `integer FK → core.users` | |
| `author_name` | `text NOT NULL` | |
| `contact_phone` | `text` | |
| `contact_email` | `text` | |
| `confirmed_count` | `integer DEFAULT 0` | |
| `resolution_confirmed_count` | `integer DEFAULT 0` | |
| `assigned_to` | `integer FK → core.organizations` | |
| `deleted_at` | `timestamp` | Soft delete |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | |

### `radar_panic_alerts`

| Columna | Tipo |
|---------|------|
| `id` | `serial PK` |
| `district_id` | `integer FK → core.districts NOT NULL` |
| `type` | `text NOT NULL` |
| `latitude` / `longitude` | `real NOT NULL` |
| `address` | `text` |
| `author_name` | `text NOT NULL` |
| `sector` | `text NOT NULL` |
| `is_active` | `boolean DEFAULT true` |
| `created_at` | `timestamp` |

### `radar_missing_persons`

| Columna | Tipo |
|---------|------|
| `id` | `serial PK` |
| `district_id` | `integer FK → core.districts NOT NULL` |
| `name` | `text NOT NULL` |
| `age` | `integer` |
| `clothing` | `text NOT NULL` |
| `photo_url` | `text` |
| `last_seen_latitude` / `longitude` | `real NOT NULL` |
| `last_seen_address` | `text NOT NULL` |
| `last_seen_at` | `timestamp NOT NULL` |
| `contact_info` | `text NOT NULL` |
| `status` | `text DEFAULT 'active'` |
| `reported_by` | `text NOT NULL` |
| `created_at` | `timestamp` |

### `radar_report_messages`

| Columna | Tipo |
|---------|------|
| `id` | `serial PK` |
| `report_id` | `integer FK → radar.reports NOT NULL` |
| `sender` | `text NOT NULL` (`admin`/`vecino`) |
| `channel` | `text NOT NULL` (`app`/`whatsapp`/`email`) |
| `content` | `text NOT NULL` |
| `admin_name` | `text` |
| `contact_phone` | `text` |
| `contact_email` | `text` |
| `read_at` | `timestamp` |
| `created_at` | `timestamp` |

### `radar_ad_slots`

| Columna | Tipo |
|---------|------|
| `id` | `serial PK` |
| `district_id` | `integer FK → core.districts NOT NULL` |
| `business_name` | `text NOT NULL` |
| `tagline` | `text NOT NULL` |
| `image_url` | `text` |
| `target_url` | `text NOT NULL` |
| `is_active` | `boolean DEFAULT true` |
| `sector` | `text` |
| `created_at` | `timestamp` |

### `radar_categories` — Categorías dinámicas de reportes

| Columna | Tipo |
|---------|------|
| `id` | `serial PK` |
| `slug` | `text UNIQUE NOT NULL` |
| `label` | `text NOT NULL` |
| `icon` | `text DEFAULT 'AlertTriangle'` |
| `color` | `text DEFAULT '#6b7280'` |
| `is_active` | `boolean DEFAULT true` |
| `sort_order` | `integer DEFAULT 0` |
| `created_at` | `timestamp` |

### `radar_departments` — Departamentos municipales

| Columna | Tipo |
|---------|------|
| `id` | `serial PK` |
| `organization_id` | `integer FK → core.organizations` |
| `name` | `text NOT NULL` |
| `description` | `text` |
| `is_active` | `boolean DEFAULT true` |
| `created_at` | `timestamp` |

---

## Schema `news` — Módulo Noticias (Fase 2)

| Tabla | Columnas clave |
|-------|---------------|
| `news_sources` | id, name, type (rss/web/telegram), config JSONB, district_id |
| `news_articles` | id, source_id, title, body, url, image_url, published_at, district_id |
| `news_categories` | id, name, slug, color |
| `news_telegram_channels` | id, chat_id, name, is_active |
| `news_approval_queue` | id, article_id, status, reviewed_by |
| `news_publication_logs` | id, article_id, channel, published_at |

## Schema `market` — Módulo Marketplace (Fase 3)

| Tabla | Columnas clave |
|-------|---------------|
| `market_stores` | id (text UUID), user_id, business_name, document_type, document_number, district_id, location, lat/lng, is_active |
| `market_categories` | id, name, slug, icon, parent_id |
| `market_products` | id, store_id, category_id, name, description, price, stock, image_url, district_id |
| `market_product_variants` | id, product_id, name, price, stock |
| `market_product_reviews` | id, product_id, user_id, rating, comment |
| `market_product_images` | id, product_id, image_url, sort_order |
| `market_offers` | id, product_id, discount, start_date, end_date |
| `market_favorites` | id, user_id, product_id |
| `market_orders` | id, store_id, buyer_id, status, total |
| `market_order_items` | id, order_id, product_id, quantity, unit_price |
| `market_clients` | id, store_id, name, phone, email |
| `market_inventory` | id, product_id, quantity, type, reference |

---

## Relaciones clave (diagrama textual)

```
core.districts
  ├── core.users (district_id)
  ├── radar.reports (district_id)
  ├── radar.panic_alerts (district_id)
  ├── radar.missing_persons (district_id)
  ├── radar.ad_slots (district_id)
  ├── core.notifications (district_id)
  ├── news.articles (district_id)       [Fase 2]
  ├── market.stores (district_id)       [Fase 3]
  └── market.products (district_id)     [Fase 3]

core.users
  ├── core.refresh_tokens (user_id)
  ├── core.user_consents (user_id)
  ├── core.notifications (user_id)
  ├── radar.reports (author_user_id)
  ├── radar.report_messages (—)
  ├── market.stores (user_id)           [Fase 3]
  ├── market.orders (buyer_id)          [Fase 3]
  ├── market.product_reviews (user_id)  [Fase 3]
  └── market.favorites (user_id)        [Fase 3]
```
