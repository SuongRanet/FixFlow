import { createBrowserRouter, Navigate } from "react-router-dom";

import { ProtectedRoute } from "../components/common/ProtectedRoute";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import NotificationsPage from "../features/notifications/pages/NotificationsPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import MyTicketsPage from "../features/tickets/pages/MyTicketsPage";
import TicketDetailPage from "../features/tickets/pages/TicketDetailPage";
import TicketsPage from "../features/tickets/pages/TicketsPage";
import UsersPage from "../features/users/pages/UsersPage";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import NotFoundPage from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  // Public routes — AuthLayout sends signed-in users to the dashboard.
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
    ],
  },

  // Everything behind the sidebar requires a valid token.
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "tickets", element: <TicketsPage /> },
      { path: "my-tickets", element: <MyTicketsPage /> },
      { path: "tickets/:id", element: <TicketDetailPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "notifications", element: <NotificationsPage /> },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);
