import { lazy, createElement } from "react";
import { type RouteObject } from "react-router-dom";

const ProductList = lazy(() => import("./pages/ProductList"));
const StoreDetail = lazy(() => import("./pages/StoreDetail"));

export const marketplaceRoutes: RouteObject[] = [
  { path: "/marketplace", element: createElement(ProductList) },
  { path: "/marketplace/store/:id", element: createElement(StoreDetail) },
];
