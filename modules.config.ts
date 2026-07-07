import type { Express } from "express";

export interface ModuleConfig {
  name: string;
  description: string;
  enabled: boolean;
  permissions: string[];
  dependencies: string[];
}

export type ModuleInit = (app: Express) => void | Promise<void>;

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
    description: "Marketplace vecinal para comercio local",
    enabled: false,
    permissions: [
      "marketplace:product.read", "marketplace:product.create", "marketplace:product.update",
      "marketplace:product.delete", "marketplace:order.read", "marketplace:order.create",
    ],
    dependencies: [],
  },
];

export default modules;
export { modules };
