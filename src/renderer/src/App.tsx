import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, HashRouter, RouteObject, useNavigate } from "react-router-dom";
import { useTourStore } from "./store/tourStore"; 

import MainLayout from "./components/layout/MainLayout";
import Loading from "./components/Loading";
import { useTourSync } from "./hooks/tourSync";

const HomePage = lazy(() => import("./views/HomePage"));
const RulePage = lazy(() => import("./views/RulePage"));
const ProfilePage = lazy(() => import("./views/ProfilePage"));
const FolderPage = lazy(() => import("./views/FolderPage"));
const ReportPage = lazy(() => import("./views/ReportPage"));
const SettingPage = lazy(() => import("./views/SettingPage"));
const AboutPage = lazy(() => import("./views/AboutPage"));
const HelpPage = lazy(() => import("./views/HelpPage"));

const appRoutes: RouteObject[] = [
  { path: "/", element: <HomePage /> },
  { path: "rules", element: <RulePage /> },
  { path: "profiles", element: <ProfilePage /> },
  { path: "folders", element: <FolderPage /> },
  { path: "report", element: <ReportPage /> },
  { path: "settings", element: <SettingPage /> },
  { path: "about", element: <AboutPage /> },
  { path: "help", element: <HelpPage /> },
];

const AppRouter = import.meta.env.MODE === "development" ? BrowserRouter : HashRouter;

function TourInitializer() {
  const initializeTour = useTourStore((state) => state.initializeTour);
  const navigate = useNavigate();

  useEffect(() => {
    initializeTour(navigate, true);
  }, [initializeTour, navigate]);

  return null;
}

function GlobalTourManager() {
  useTourSync();
  return null;
}

function App() {
  return (
    <AppRouter>
      <TourInitializer />
      <GlobalTourManager />
      <Suspense fallback={<Loading isLoading />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {appRoutes.map((route) => (
              <Route
                key={route.path}
                index={route.path === "/"}
                path={route.path === "/" ? undefined : route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Routes>
      </Suspense>
    </AppRouter>
  );
}

export default App;
