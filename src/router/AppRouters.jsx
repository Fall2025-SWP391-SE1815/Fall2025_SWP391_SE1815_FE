// Template

import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Layouts
import MainLayout from "../components/layout/MainLayout.jsx";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import StaffLayout from "../pages/staff/StaffLayout.jsx";

// Components
import Home from "../components/layout/Home.jsx";
import LoginPage from "../components/auth/LoginPage.jsx";
import RegisterPage from "../components/auth/RegisterPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";

// Admin Components
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminLayout from "../pages/admin/AdminLayout.jsx";
import StationsManagement from "../pages/admin/StationsManagement.jsx";
import VehiclesManagement from "../pages/admin/VehiclesManagement.jsx";
import PersonnelManagement from "../pages/admin/PersonnelManagement.jsx";
import StationStaffManagement from "../pages/admin/StationStaffManagement.jsx";
import SystemMonitoring from "../pages/admin/SystemMonitoring.jsx";
import ComplaintsManagement from "../pages/admin/ComplaintsManagement.jsx";
import ReportsAndStatistics from "../pages/admin/ReportsAndStatistics.jsx";

// Renter Components
import RentalPage from "../pages/renter/RentalPage.jsx";
import HistoryPage from "../pages/renter/HistoryPage.jsx";
import PaymentPage from "../pages/renter/PaymentPage.jsx";
import ProfilePage from "../pages/renter/ProfilePage.jsx";
import ReservationsPage from "../pages/renter/ReservationsPage.jsx";
import StationsPage from "../pages/renter/StationsPage.jsx";
import VehiclesPage from "../pages/renter/VehiclesPage.jsx";
import ComplaintsPage from "../pages/renter/ComplaintsPage.jsx";
import IncidentsPage from "../pages/renter/IncidentsPage.jsx";
import AnalyticsPage from "../pages/renter/AnalyticsPage.jsx";
import DocumentsPage from "../pages/renter/DocumentsPage.jsx";

// New Rental Workflow Components
import RentalCheckinPage from "../pages/renter/RentalCheckinPage.jsx";
import RentalCurrentPage from "../pages/renter/RentalCurrentPage.jsx";
import RentalChecksPage from "../pages/renter/RentalChecksPage.jsx";
import RentalReturnPage from "../pages/renter/RentalReturnPage.jsx";
import RentalPaymentPage from "../pages/renter/RentalPaymentPage.jsx";
import RentalSummaryPage from "../pages/renter/RentalSummaryPage.jsx";
import RentalDetailPage from "../pages/renter/RentalDetailPage.jsx";
import PaymentDetailPage from "../pages/renter/PaymentDetailPage.jsx";
import ComplaintDetailPage from "../pages/renter/ComplaintDetailPage.jsx";

// Staff Components
import StaffDashboard from "../pages/staff/StaffDashboard.jsx";
import RentalManagement from "../pages/staff/RentalManagement.jsx";
import CustomerVerification from "../pages/staff/CustomerVerification.jsx";
import PaymentManagement from "../pages/staff/PaymentManagement.jsx";
import StationManagement from "../pages/staff/StationManagement.jsx";

// Routes wrapper
import PublicRoute from "../routes/PublicRoute.jsx";
import ProtectedRoute from "../routes/ProtectedRoute.jsx";

// Auth Provider
import { AuthProvider } from "../hooks/auth/useAuth.jsx";

// Path constants
export const paths = {
  home: "/",
  login: "/login",
  register: "/register",
  
  // Admin routes
  admin: {
    dashboard: "/admin",
    stations: "stations",
    vehicles: "vehicles", 
    personnel: "personnel",
    stationStaff: "station-staff",
    monitoring: "monitoring",
    complaints: "complaints",
    reports: "reports"
  },
  
  // Renter routes
  renter: {
    dashboard: "/dashboard",
    profile: "profile",
    booking: "booking",
    reservations: "reservations",
    currentRentals: "rentals/current",
    history: "history",
    locations: "locations",
    payments: "payments",
    documents: "documents",
    complaints: "complaints",
    incidents: "incidents",
    analytics: "analytics",
    // New rental workflow routes
    rental: {
      checkin: "/rentals/checkin",
      current: "/rentals/current",
      checks: "/rentals/:id/checks",
      return: "/rentals/:id/return",
      payment: "/rentals/:id/payment",
      summary: "/rentals/:id/summary"
    }
  },
  
  // Staff routes  
  staff: {
    dashboard: "/staff",
    rentalManagement: "rental-management",
    customerVerification: "customer-verification", 
    paymentManagement: "payment-management",
    stationManagement: "station-management"
  },
  
  notFound: "*",
};

// Default route by role
export const getDefaultRouteByRole = (role) => {
  switch (role) {
    case "admin":
      return "/admin";
    case "staff":
      return "/staff";
    case "renter":
      return "/"; // Renter về trang chủ
    default:
      return "/login";
  }
};

// Router setup
const router = createBrowserRouter([
  // Public routes - Trang chủ có thể truy cập mà không cần đăng nhập
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> }
    ],
  },
  
  // Auth routes (public)
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/register", 
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  
  // Admin routes
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "stations", element: <StationsManagement /> },
      { path: "vehicles", element: <VehiclesManagement /> },
      { path: "personnel", element: <PersonnelManagement /> },
      { path: "station-staff", element: <StationStaffManagement /> },
      { path: "monitoring", element: <SystemMonitoring /> },
      { path: "complaints", element: <ComplaintsManagement /> },
      { path: "reports", element: <ReportsAndStatistics /> },
    ],
  },
  
  // Staff routes
  {
    path: "/staff",
    element: (
      <ProtectedRoute requiredRole="staff">
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <StaffDashboard /> },
      { path: "rental-management", element: <RentalManagement /> },
      { path: "customer-verification", element: <CustomerVerification /> },
      { path: "payment-management", element: <PaymentManagement /> },
      { path: "station-management", element: <StationManagement /> },
    ],
  },
  
  // Renter protected pages (using MainLayout for consistency)
  {
    path: "/profile",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ProfilePage /> }
    ]
  },
  {
    path: "/rental",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <RentalPage /> }
    ]
  },
  {
    path: "/stations",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <StationsPage /> }
    ]
  },
  {
    path: "/vehicles",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <VehiclesPage /> }
    ]
  },
  {
    path: "/reservations",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ReservationsPage /> }
    ]
  },
  {
    path: "/history",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HistoryPage /> }
    ]
  },
  {
    path: "/payments",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <PaymentPage /> }
    ]
  },
  {
    path: "/rental-detail/:id",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <RentalDetailPage /> }
    ]
  },
  {
    path: "/payment-detail/:id",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <PaymentDetailPage /> }
    ]
  },
  {
    path: "/complaint-detail/:id",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ComplaintDetailPage /> }
    ]
  },
  {
    path: "/documents",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DocumentsPage /> }
    ]
  },
  {
    path: "/complaints", 
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ComplaintsPage /> }
    ]
  },
  {
    path: "/incidents",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <IncidentsPage /> }
    ]
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AnalyticsPage /> }
    ]
  },

  // Rental Workflow Routes (alternative paths for compatibility)
  {
    path: "/rentals",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "checkin", element: <RentalCheckinPage /> },
      { path: "current", element: <RentalCurrentPage /> },
      { path: "checks", element: <RentalChecksPage /> },
      { path: "checks/:id", element: <RentalChecksPage /> },
      { path: "return", element: <RentalReturnPage /> },
      { path: "payment", element: <RentalPaymentPage /> },
      { path: "summary", element: <RentalSummaryPage /> }
    ]
  },
  
  // Not found
  { path: "*", element: <NotFoundPage /> },
]);

// AppRouter component with AuthProvider
export const AppRouter = () => (
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
