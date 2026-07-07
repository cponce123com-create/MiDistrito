/**
 * modules.config.ts — Registro central de módulos de MiDistrito.
 *
 * Cada módulo registra:
 * - name: Identificador único del módulo
 * - description: Descripción breve
 * - enabled: Si está activo en esta instalación
 * - backend: Ruta relativa a modules/<name>/backend
 * - frontend: Ruta relativa a modules/<name>/frontend
 * - permissions: Lista de permisos que define el módulo
 * - dependencies: Otros módulos de los que depende
 *
 * El cargador de apps/api lee este archivo para registrar rutas,
 * schemas y workers automáticamente.
 */

export interface ModuleConfig {
  name: string;
  description: string;
  enabled: boolean;
  backend: string;
  frontend?: string;
  permissions: string[];
  dependencies: string[];
}

const modules: ModuleConfig[] = [
  {
    name: "radar",
    description: "Reportes ciudadanos, alertas de pánico y personas desaparecidas",
    enabled: true,
    backend: "./modules/radar/backend",
    frontend: "./modules/radar/frontend",
    permissions: [
      "radar:report.create",
      "radar:report.read",
      "radar:report.update",
      "radar:report.delete",
      "radar:alert.read",
      "radar:missing_person.read",
    ],
    dependencies: [],
  },
  {
    name: "news",
    description: "Noticias y comunicados municipales",
    enabled: false,
    backend: "./modules/news/backend",
    permissions: [
      "news:article.read",
      "news:article.create",
      "news:article.update",
      "news:article.delete",
    ],
    dependencies: [],
  },
  {
    name: "marketplace",
    description: "Marketplace vecinal para comercio local",
    enabled: false,
    backend: "./modules/marketplace/backend",
    permissions: [
      "marketplace:product.read",
      "marketplace:product.create",
      "marketplace:product.update",
      "marketplace:product.delete",
      "marketplace:order.read",
      "marketplace:order.create",
    ],
    dependencies: [],
  },
];

export default modules;
export { modules };
