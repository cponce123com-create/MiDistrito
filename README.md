# MiDistrito

Plataforma cívica multi-distrito para reportes vecinales, alertas de seguridad y gestión municipal.

## Stack

| Capa | Tecnología |
|------|-----------|
| **Backend** | Express + TypeScript (monolito modular) |
| **Frontend** | React + Vite + Tailwind CSS v4 + shadcn/ui |
| **Database** | PostgreSQL (Neon) con Drizzle ORM |
| **Auth** | JWT (access + refresh tokens), bcryptjs |
| **Monorepo** | pnpm workspaces |

## Arquitectura

Monolito modular con libs compartidas. Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para ADRs completos.

```
mi-distrito/
├── apps/
│   ├── api/          # Backend Express — Core + módulos registrados
│   └── web/          # Frontend React + Vite + Tailwind
├── lib/              # Librerías compartidas (workspaces)
│   ├── db/           # Drizzle ORM — schema, migrations, conexión
│   ├── api-zod/      # Schemas Zod compartidos frontend/backend
│   ├── api-spec/     # OpenAPI spec + orval config
│   ├── api-client-react/  # React Query hooks generados
│   └── object-storage/    # Cloudinary facade
├── modules/          # Módulos de dominio (radar, news, marketplace)
├── docs/             # ADRs, ERD, roadmap
└── scripts/          # Utilidades de desarrollo
```

## Empezar

```bash
# Instalar dependencias (desde la raíz)
pnpm install

# Iniciar backend (puerto 3000)
pnpm dev:api

# Iniciar frontend (puerto 5173)
pnpm dev:web

# Construir todo
pnpm build
```

Variables de entorno requeridas (ver `.env.example`):
- `PORT` — Puerto del backend
- `DATABASE_URL` — URL de PostgreSQL
- `JWT_SECRET` — Secreto para firmar tokens
- `CORS_ORIGIN` — Orígenes permitidos (separados por coma)

## Documentación

- [Arquitectura y ADRs](docs/ARCHITECTURE.md)
- [Modelo de datos (ERD)](docs/ERD.md)
- [Inventario de assets](docs/INVENTORY.md)
- [Roadmap](docs/ROADMAP.md)

## Módulos

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| Radar Vecinal | ⏳ Portándose | Reportes ciudadanos, alertas de pánico, personas desaparecidas |
| Noticias | 📅 Fase 2 | Agregador de noticias locales con bot de Telegram |
| Marketplace | 📅 Fase 3 | Directorio comercial y ventas por distrito |
