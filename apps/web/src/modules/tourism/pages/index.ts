import { lazy, createElement } from "react";
const AttractionsList = lazy(() => import("../pages/AttractionsList"));
const AttractionDetail = lazy(() => import("../pages/AttractionDetail"));
export const tourismRoutes = [
  { path: "/turismo", element: createElement(AttractionsList) },
  { path: "/turismo/:id", element: createElement(AttractionDetail) },
];
