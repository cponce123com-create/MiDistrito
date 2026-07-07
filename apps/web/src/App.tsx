import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./core/AuthContext";
import { DistrictProvider } from "./core/DistrictContext";
import { radarRoutes } from "./modules/radar/routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="max-w-lg mx-auto">{children}</main>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <DistrictProvider>
            <Layout>
              <Suspense fallback={<Loading />}>
                <Routes>
                  {radarRoutes.map((route) => (
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
