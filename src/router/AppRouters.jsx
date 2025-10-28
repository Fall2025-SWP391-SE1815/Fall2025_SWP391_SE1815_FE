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
import StationsManagement from "../pages/admin/stations/StationsManagement.jsx";
import VehiclesManagement from "../pages/admin/vehicles/VehiclesManagement.jsx";
import PersonnelManagement from "../pages/admin/personnel/PersonnelManagement.jsx";
import StationStaffManagement from "../pages/admin/staff-stations/StationStaffManagement.jsx";
import SystemMonitoring from "../pages/admin/rentals/SystemMonitoring.jsx";
import ComplaintsManagement from "../pages/admin/ComplaintsManagement.jsx";
import StaffPerformance from "../pages/admin/StaffPerformance.jsx";

// Renter Components
import HistoryPage from "../pages/renter/history/HistoryPage.jsx";
import PaymentPage from "../pages/renter/history/PaymentPage.jsx";
import ProfilePage from "../pages/renter/profile/ProfilePage.jsx";
import ReservationsPage from "../pages/renter/booking/ReservationsPage.jsx";
import StationsPage from "../pages/renter/booking/StationsPage.jsx";
import VehiclesPage from "../pages/renter/booking/VehiclesPage.jsx";
import ComplaintsPage from "../pages/renter/complaints/ComplaintsPage.jsx";
import IncidentsPage from "../pages/renter/incidents/IncidentsPage.jsx";

// Public Components (Guest accessible)
import PublicStationsPage from "../pages/public/PublicStationsPage.jsx";
import PublicVehiclesPage from "../pages/public/PublicVehiclesPage.jsx";

// New Rental Workflow Components
import RentalCurrentPage from "../pages/renter/current/RentalCurrentPage.jsx";
import RentalChecksPage from "../pages/renter/current/RentalChecksPage.jsx";
import RentalDetailPage from "../pages/renter/history/RentalDetailPage.jsx";
import PaymentDetailPage from "../pages/renter/history/PaymentDetailPage.jsx";
import ComplaintDetailPage from "../pages/renter/complaints/ComplaintDetailPage.jsx";

// Staff Components
import StaffDashboard from "../pages/staff/StaffDashboard.jsx";
import RentalManagement from "../pages/staff/rental-management/RentalManagement.jsx";
import CustomerVerification from "@/pages/staff/customer-verification/CustomerVerification.jsx";
import PaymentManagement from "../pages/staff/payment-management/PaymentManagement.jsx";
import StationManagement from "../pages/staff/station-management/StationManagement.jsx";

// Routes wrapper
import PublicRoute from "../routes/PublicRoute.jsx";
import ProtectedRoute from "../routes/ProtectedRoute.jsx";

// Auth Provider
import { AuthProvider } from "../hooks/auth/useAuth.jsx";
import VehicleManagement from "@/pages/staff/vehicle-management/VehicleManagement.jsx";
import IncidentReportManagement from "@/pages/staff/IncidentReportManagement.jsx";


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
    performance: "performance"
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
    complaints: "complaints",
    incidents: "incidents",
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

  // Public pages - Guest có thể xem
  {
    path: "/public/stations",
    element: <MainLayout />,
    children: [
      { index: true, element: <PublicStationsPage /> }
    ],
  },
  {
    path: "/public/vehicles",
    element: <MainLayout />,
    children: [
      { index: true, element: <PublicVehiclesPage /> }
    ],
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
      { path: "performance", element: <StaffPerformance /> },
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
      { path: "vehicle-management", element: <VehicleManagement />, },
      { path: "incident-management", element: <IncidentReportManagement /> },
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

  // Rental Workflow Routes (alternative paths for compatibility)
  {
    path: "/rentals",
    element: (
      <ProtectedRoute requiredRole="renter">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "current", element: <RentalCurrentPage /> },
      { path: "checks", element: <RentalChecksPage /> },
      { path: "checks/:id", element: <RentalChecksPage /> }
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
