import { lazy, createElement } from "react";
import { type RouteObject } from "react-router-dom";

const NewsList = lazy(() => import("../pages/NewsList"));
const ApprovalQueue = lazy(() => import("../pages/ApprovalQueue"));
const Sources = lazy(() => import("../pages/Sources"));

export const newsRoutes: RouteObject[] = [
  { path: "/noticias", element: createElement(NewsList) },
  { path: "/noticias/aprobar", element: createElement(ApprovalQueue) },
  { path: "/noticias/fuentes", element: createElement(Sources) },
];
