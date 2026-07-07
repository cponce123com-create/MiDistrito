import { lazy, createElement } from "react";
const EventsList = lazy(() => import("./pages/EventsList"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
export const eventsRoutes = [
  { path: "/eventos", element: createElement(EventsList) },
  { path: "/eventos/:id", element: createElement(EventDetail) },
];
