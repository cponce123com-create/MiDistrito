import { type RouteObject } from "react-router-dom";
import { lazy, createElement } from "react";

const Home = lazy(() => import("./pages/Home"));
const CreateReport = lazy(() => import("./pages/CreateReport"));
const ReportDetail = lazy(() => import("./pages/ReportDetail"));
const ReportList = lazy(() => import("./pages/ReportList"));
const Alerts = lazy(() => import("./pages/Alerts"));
const MissingPersons = lazy(() => import("./pages/MissingPersons"));

export const radarRoutes: RouteObject[] = [
  { path: "/", element: createElement(Home) },
  { path: "/reportar", element: createElement(CreateReport) },
  { path: "/reportes", element: createElement(ReportList) },
  { path: "/reportes/:id", element: createElement(ReportDetail) },
  { path: "/alertas", element: createElement(Alerts) },
  { path: "/desaparecidos", element: createElement(MissingPersons) },
];
