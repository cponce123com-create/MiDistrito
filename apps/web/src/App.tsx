import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./core/AuthContext";
import { DistrictProvider, useDistrict } from "./core/DistrictContext";
import { useAuth } from "./core/AuthContext";
import { radarRoutes } from "./modules/radar/routes";
import { newsRoutes } from "./modules/news/routes";
import { marketplaceRoutes } from "./modules/marketplace/routes";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

/* ---------- SVG icon components ---------- */
const Icons = {
  home: (fill?: boolean) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill={fill ? "#2DD4BF" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
  radar: (fill?: boolean) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill={fill ? "#2DD4BF" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.7 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  ),
  news: (fill?: boolean) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill={fill ? "#2DD4BF" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18h-5" /><path d="M18 14h-8" /><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    </svg>
  ),
  store: (fill?: boolean) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill={fill ? "#2DD4BF" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 7 4.4-4.4A2 2 0 0 1 7.8 2h8.4a2 2 0 0 1 1.4.6L22 7" /><path d="M2 7h20v3a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" /><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
    </svg>
  ),
  profile: (fill?: boolean) => (
    <svg width="23" height="23" viewBox="0 0 24 24" fill={fill ? "#2DD4BF" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  ),
  pin: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  chevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /><path d="M21 15.3a4 4 0 0 0-1-2.3l-1-1V8a7 7 0 0 0-14 0v4l-1 1a4 4 0 0 0-1 2.3" /><path d="M3 15.3h18" />
    </svg>
  ),
  sos: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 18v-6a5 5 0 0 1 10 0v6" /><path d="M5 21a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1z" /><path d="M21 12h1M12 2v1M2 12h1" /><path d="M4.9 4.9l.7.7" />
    </svg>
  ),
  logo: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
};

/* ---------- Bottom Navigation (mobile) ---------- */
const navTabs = [
  { path: "/", label: "Inicio", icon: Icons.home },
  { path: "/alertas", label: "Radar", icon: Icons.radar },
  { path: "/noticias", label: "Noticias", icon: Icons.news },
  { path: "/marketplace", label: "Tiendas", icon: Icons.store },
  { path: "/perfil", label: "Perfil", icon: Icons.profile },
];

const sidebarTabs = [
  { path: "/", label: "Inicio", icon: Icons.home },
  { path: "/alertas", label: "Radar", icon: Icons.radar },
  { path: "/noticias", label: "Noticias", icon: Icons.news },
  { path: "/marketplace", label: "Tiendas", icon: Icons.store },
  { path: "/perfil", label: "Perfil", icon: Icons.profile },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <nav className="bottom-nav mobile-only">
      {navTabs.map((tab) => {
        const isActive =
          tab.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(tab.path);
        return (
          <button
            key={tab.path}
            className={`nav-item${isActive ? " active" : ""}`}
            onClick={() => navigate(tab.path)}
          >
            {tab.icon(isActive)}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------- SOS Floating Button ---------- */
function SosButton() {
  const navigate = useNavigate();
  return (
    <button className="sos-float mobile-only" onClick={() => navigate("/alertas")}>
      {Icons.sos()}
      <span>SOS</span>
    </button>
  );
}

/* ---------- Loading Spinner ---------- */
function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-[var(--md-primary)] border-t-transparent rounded-full" />
    </div>
  );
}

/* ---------- Mobile Shell ---------- */
function MobileShell({ children }: { children: React.ReactNode }) {
  const { currentDistrict } = useDistrict();
  const { user } = useAuth();
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };
  return (
    <div className="mobile-layout mobile-only">
      {/* Status bar */}
      <div className="status-bar">
        <span className="time">
          {new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false })}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Signal icons placeholder */}
          <svg width="17" height="12" viewBox="0 0 18 12" fill="#fff"><rect x="0" y="7" width="3" height="5" rx="1" /><rect x="5" y="4" width="3" height="8" rx="1" /><rect x="10" y="1.5" width="3" height="10.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" opacity=".4" /></svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"><path d="M1 4.5a10 10 0 0 1 14 0" /><path d="M3.5 7a6 6 0 0 1 9 0" /><path d="M6 9.5a2.5 2.5 0 0 1 4 0" /></svg>
          <svg width="24" height="12" viewBox="0 0 26 13" fill="none"><rect x="1" y="1" width="21" height="11" rx="3" stroke="#fff" strokeWidth="1.4" /><rect x="3" y="3" width="16" height="7" rx="1.5" fill="#fff" /><rect x="23" y="4" width="2" height="5" rx="1" fill="#fff" /></svg>
        </div>
      </div>

      {/* App header */}
      <div className="app-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button className="district-chip">
            {Icons.pin()}
            {currentDistrict || "Seleccionar distrito"}
            {Icons.chevronDown()}
          </button>
          <button className="notification-bell">
            {Icons.bell()}
            <span className="badge" />
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="greeting-text">{getGreeting()}{user ? `, ${user.name}` : ""}</div>
          <div className="hero-text">Tu distrito, hoy</div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="scroll-body" style={{ paddingBottom: 100 }}>
        {children}
      </div>

      {/* SOS floating */}
      <SosButton />

      {/* Bottom nav */}
      <BottomNav />
    </div>
  );
}

/* ---------- Desktop Shell ---------- */
function DesktopShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentDistrict } = useDistrict();
  const { user } = useAuth();
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="desktop-layout desktop-only">
      {/* Sidebar */}
      <div className="nav-sidebar">
        <div className="logo">
          <div className="logo-icon">{Icons.logo()}</div>
          <span className="logo-text">MiDistrito</span>
        </div>
        {sidebarTabs.map((tab) => {
          const isActive =
            tab.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              className={`nav-link${isActive ? " active" : ""}`}
              onClick={() => navigate(tab.path)}
            >
              {tab.icon(isActive)}
              {tab.label}
            </button>
          );
        })}
        <div style={{ marginTop: "auto" }}>
          <button className="btn-danger" style={{ width: "100%" }} onClick={() => navigate("/alertas")}>
            {Icons.sos()}
            SOS
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="desktop-main">
        {/* Top bar */}
        <div className="top-bar">
          <div>
            <div className="greeting">{getGreeting()}{user ? `, ${user.name}` : ""}</div>
            <div className="title">Tu distrito, hoy</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="district-chip"
              style={{
                background: "var(--md-primary-50)",
                color: "var(--md-primary-700)",
              }}
            >
              {Icons.pin()}
              {currentDistrict || "Seleccionar distrito"}
              {Icons.chevronDown()}
            </button>
            <button
              className="notification-bell"
              style={{
                background: "var(--md-bg)",
                border: "1px solid var(--md-border)",
              }}
            >
              {Icons.bell()}
              <span
                className="badge"
                style={{
                  borderColor: "var(--md-card)",
                  right: 9,
                  top: 8,
                }}
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="desktop-content">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Main Layout ---------- */
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileShell>{children}</MobileShell>
      <DesktopShell>{children}</DesktopShell>
    </>
  );
}

/* ---------- App ---------- */
export default function App() {
  const allRoutes = [...radarRoutes, ...newsRoutes, ...marketplaceRoutes];
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <DistrictProvider>
            <Layout>
              <Suspense fallback={<Loading />}>
                <Routes>
                  {allRoutes.map((route) => (
                    <Route key={route.path} path={route.path!} element={route.element} />
                  ))}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          </DistrictProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
