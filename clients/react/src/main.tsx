import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import "./styles/global.scss";

import Landing from "./components/Landing/Landing";
import GetStarted from "./pages/GetStarted";
import Legal from "./pages/Legal";
import Support from "./pages/Support";
import Development from "./pages/Development";
import Dashboard from "./components/Dashboard/Dashboard";
import Authenticator from "./components/Auth/Authenticator";
import NotFound from "./components/NotFound/NotFound";
import { isAuthenticated } from "./services/session";
import Streaming from "./components/Stream/Streaming";
import ForgetPassword from "./components/ForgetPassword/ForgetPassword";
import AppRoot from "./components/AppRoot/AppRoot";
import Inventory from "./pages/Inventory";
import { SessionProvider } from "./context/SessionContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

const ProtectedLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
};

// Root redirect: if authenticated -> /dashboard; else -> /landed
const RootRedirect: React.FC = () => (
  <Navigate to={isAuthenticated() ? "/dashboard" : "/landed"} replace />
);

const router = createBrowserRouter([
  {
    element: <AppRoot />,
    children: [
      { path: "/landed", element: <Landing /> }, // public landing page
      { path: "/get-started", element: <GetStarted /> }, // sign up
      { path: "/legal", element: <Legal /> },
      { path: "/support", element: <Support /> },
      { path: "/development", element: <Development /> },
      { path: "/auth", element: <Authenticator /> }, // public login
      { path: "/", element: <RootRedirect /> }, // dynamic redirect based on auth
      { path: "/resetpw", element: <ForgetPassword /> }, // public forget password page
      
      {
        element: <ProtectedLayout />, // wrapper for protected routes
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          // Created by Aditya Goyal for streaming page: Add route to access the live camera streaming page under protected routes
          { path: "/streaming", element: <Streaming /> },
          { path: "/inventory", element: <Inventory /> },
        ],
      },
      { path: "*", element: <NotFound /> }, // public catch-all
    ],
  },
]);

const container = document.getElementById("root");
if (!container) throw new Error("Root container missing in index.html");

createRoot(container).render(
  <StrictMode>
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  </StrictMode>
);
