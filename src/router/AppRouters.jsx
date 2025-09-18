// Template

import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

// Routes wrapper
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

// Path constants
export const paths = {
  home: "/",
  login: "/auth/login",
  register: "/auth/register",
  profile: "/profile",
  userDashboard: "/user/dashboard",
  notFound: "*",
};

// Default route by role
export const getDefaultRouteByRole = (role) => {
  switch (role) {
    case "admin":
      return paths.userDashboard;
    case "user":
      return paths.userDashboard;
    default:
      return paths.login;
  }
};

// Router setup
const router = createBrowserRouter([
  // Public routes
  {
    path: paths.home,
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        element: <PublicRoute />,
        children: [
          { path: paths.login, element: <LoginPage /> },
          { path: paths.register, element: <RegisterPage /> },
        ],
      },
    ],
  },
  // Protected routes
  {
    path: paths.home,
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: paths.profile, element: <ProfilePage /> },
    ],
  },
  // User dashboard
  {
    path: paths.userDashboard,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
    ],
  },
  // Not found
  { path: paths.notFound, element: <NotFoundPage /> },
]);

// AppRouter component
export const AppRouter = () => <RouterProvider router={router} />;
