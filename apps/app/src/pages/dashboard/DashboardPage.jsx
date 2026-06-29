import { useEffect, useState } from "react";
import { fetchDashboard } from "../../services/dashboardApi";

import AdminDashboardPage from "./AdminDashboardPage";
import ManagerDashboardPage from "./ManagerDashboardPage";
import EmployeeDashboardPage from "./EmployeeDashboardPage";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="dashboard-card">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="auth-error">{error}</div>;
  }

  if (!dashboard) {
    return <div className="dashboard-card">No dashboard data found.</div>;
  }

  if (dashboard.role === "admin") {
    return <AdminDashboardPage data={dashboard} />;
  }

  if (dashboard.role === "manager") {
    return <ManagerDashboardPage data={dashboard} />;
  }

  return <EmployeeDashboardPage data={dashboard} />;
}