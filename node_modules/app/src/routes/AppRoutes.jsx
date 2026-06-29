import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";

import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";

import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import VerifyOtpPage from "../pages/auth/VerifyOtpPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

import DashboardPage from "../pages/dashboard/DashboardPage";

import AttendancePage from "../pages/attendance/AttendancePage";
import AttendanceHistoryPage from "../pages/attendance/AttendanceHistoryPage";
import ReportsPage from "../pages/attendance/ReportsPage";
import AttendanceAnalyticsPage from "../pages/analytics/AttendanceAnalyticsPage";

import LeavesPage from "../pages/leaves/LeavesPage";
import HolidaysPage from "../pages/holidays/HolidaysPage";

import EmployeesPage from "../pages/employees/EmployeesPage";
import EmployeeCreatePage from "../pages/employees/EmployeeCreatePage";
import EmployeeDetailPage from "../pages/employees/EmployeeDetailPage";
import EmployeeEditPage from "../pages/employees/EmployeeEditPage";
import DepartmentsPage from "../pages/employees/DepartmentsPage";
import DesignationsPage from "../pages/employees/DesignationsPage";
import ShiftsPage from "../pages/employees/ShiftsPage";

import PayrollPage from "../pages/payroll/PayrollPage";
import SalarySlipsPage from "../pages/salary/SalarySlipsPage";

import ProjectsPage from "../pages/projects/ProjectsPage";
import ProjectCreatePage from "../pages/projects/ProjectCreatePage";
import ProjectEditPage from "../pages/projects/ProjectEditPage";
import ProjectDetailPage from "../pages/projects/ProjectDetailPage";

import TasksPage from "../pages/tasks/TasksPage";
import TaskBuilderPage from "../pages/tasks/TaskBuilderPage";

import NotificationsPage from "../pages/notifications/NotificationsPage";
import ReportsCenterPage from "../pages/reports/ReportsCenterPage";

import CompanySettingsPage from "../pages/settings/CompanySettingsPage";
import RolesPermissionsPage from "../pages/settings/RolesPermissionsPage";

import ProfilePage from "../pages/profile/ProfilePage";
import EditProfilePage from "../pages/profile/EditProfilePage";
import FinanceExpensesPage from "../pages/finance/FinanceExpensesPage";
import FinanceExpenseDetailPage from "../pages/finance/FinanceExpenseDetailPage";

function Guard({ roles, children }) {
  return (
    <ProtectedRoute>
      <RoleRoute roles={roles}>{children}</RoleRoute>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <Guard roles={["admin", "manager", "employee"]}>
              <DashboardPage />
            </Guard>
          }
        />

        <Route
          path="/attendance"
          element={
            <Guard roles={["admin", "manager", "employee"]}>
              <AttendancePage />
            </Guard>
          }
        />

        <Route
          path="/attendance-history"
          element={
            <Guard roles={["admin", "manager", "employee"]}>
              <AttendanceHistoryPage />
            </Guard>
          }
        />
        <Route
  path="/finance-expenses"
  element={
    <Guard roles={["admin", "manager"]}>
      <FinanceExpensesPage />
    </Guard>
  }
/>

<Route
  path="/finance-expenses/:id"
  element={
    <Guard roles={["admin", "manager"]}>
      <FinanceExpenseDetailPage />
    </Guard>
  }
/>

        <Route
          path="/attendance-analytics"
          element={
            <Guard roles={["admin", "manager"]}>
              <AttendanceAnalyticsPage />
            </Guard>
          }
        />

        <Route
          path="/reports"
          element={
            <Guard roles={["admin", "manager"]}>
              <ReportsPage />
            </Guard>
          }
        />

        <Route
          path="/reports-center"
          element={
            <Guard roles={["admin", "manager"]}>
              <ReportsCenterPage />
            </Guard>
          }
        />

        <Route
          path="/leaves"
          element={
            <Guard roles={["admin", "manager", "employee"]}>
              <LeavesPage />
            </Guard>
          }
        />

        <Route
          path="/holidays"
          element={
            <Guard roles={["admin", "manager", "employee"]}>
              <HolidaysPage />
            </Guard>
          }
        />

        <Route
          path="/employees"
          element={
            <Guard roles={["admin", "manager", "employee"]}>
              <EmployeesPage />
            </Guard>
          }
        />

        <Route
          path="/employees/create"
          element={
            <Guard roles={["admin"]}>
              <EmployeeCreatePage />
            </Guard>
          }
        />

        <Route
          path="/employees/:id/edit"
          element={
            <Guard roles={["admin"]}>
              <EmployeeEditPage />
            </Guard>
          }
        />

        <Route
          path="/employees/:id"
          element={
            <Guard roles={["admin", "manager", "employee"]}>
              <EmployeeDetailPage />
            </Guard>
          }
        />

        <Route
          path="/departments"
          element={
            <Guard roles={["admin", "manager"]}>
              <DepartmentsPage />
            </Guard>
          }
        />

        <Route
          path="/designations"
          element={
            <Guard roles={["admin", "manager"]}>
              <DesignationsPage />
            </Guard>
          }
        />

        <Route
          path="/shifts"
          element={
            <Guard roles={["admin"]}>
              <ShiftsPage />
            </Guard>
          }
        />

        <Route
          path="/payroll"
          element={
            <Guard roles={["admin"]}>
              <PayrollPage />
            </Guard>
          }
        />

        <Route
          path="/salary-slips"
          element={
            <Guard roles={["admin", "employee"]}>
              <SalarySlipsPage />
            </Guard>
          }
        />

        <Route
          path="/projects"
          element={
            <Guard roles={["admin", "manager", "employee"]}>
              <ProjectsPage />
            </Guard>
          }
        />

        <Route
          path="/projects/create"
          element={
            <Guard roles={["admin"]}>
              <ProjectCreatePage />
            </Guard>
          }
        />

        <Route
          path="/projects/:id"
          element={
            <Guard roles={["admin", "manager", "employee"]}>
              <ProjectDetailPage />
            </Guard>
          }
        />

        <Route
          path="/projects/:id/edit"
          element={
            <Guard roles={["admin"]}>
              <ProjectEditPage />
            </Guard>
          }
        />

        <Route
          path="/tasks"
          element={
            <Guard roles={["admin", "manager", "employee"]}>
              <TasksPage />
            </Guard>
          }
        />

        <Route
          path="/tasks/create"
          element={
            <Guard roles={["admin", "manager"]}>
              <TaskBuilderPage />
            </Guard>
          }
        />

        <Route
          path="/notifications"
          element={
            <Guard roles={["admin", "manager", "employee"]}>
              <NotificationsPage />
            </Guard>
          }
        />

        <Route
          path="/settings/company"
          element={
            <Guard roles={["admin"]}>
              <CompanySettingsPage />
            </Guard>
          }
        />

        <Route
          path="/settings/roles"
          element={
            <Guard roles={["admin"]}>
              <RolesPermissionsPage />
            </Guard>
          }
        />
        <Route
  path="/profile"
  element={
    <Guard roles={["admin", "manager", "employee"]}>
      <ProfilePage />
    </Guard>
  }
/>

<Route
  path="/profile/edit"
  element={
    <Guard roles={["admin", "manager", "employee"]}>
      <EditProfilePage />
    </Guard>
  }
/>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}