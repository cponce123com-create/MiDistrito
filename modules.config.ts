import type { Express } from "express";

export interface ModuleConfig {
  name: string;
  description: string;
  enabled: boolean;
  permissions: string[];
  dependencies: string[];
}

const modules: ModuleConfig[] = [
  {
    name: "radar",
    description: "Reportes ciudadanos, alertas de pánico y personas desaparecidas",
    enabled: true,
    permissions: [
      "radar:report.create", "radar:report.read", "radar:report.update", "radar:report.delete",
      "radar:alert.read", "radar:missing_person.read",
    ],
    dependencies: [],
  },
  {
    name: "news",
    description: "Noticias y comunicados municipales con scraping RSS y publicación Telegram",
    enabled: true,
    permissions: [
      "news:article.read", "news:article.create", "news:article.update", "news:article.delete",
      "news:article.approve", "news:source.manage",
    ],
    dependencies: [],
  },
  {
    name: "marketplace",
    description: "Marketplace vecinal con tiendas, productos y pedidos",
    enabled: true,
    permissions: [
      "marketplace:store.create", "marketplace:store.update", "marketplace:product.create",
      "marketplace:product.read", "marketplace:product.update", "marketplace:product.delete",
      "marketplace:order.create", "marketplace:order.read", "marketplace:favorite",
    ],
    dependencies: [],
  },
];

export default modules;
export { modules };
