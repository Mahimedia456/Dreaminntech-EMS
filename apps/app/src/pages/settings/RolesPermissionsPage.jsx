import { useEffect, useMemo, useState } from "react";
import { fetchPermissions, savePermissions } from "../../services/settingsApi";

const modules = [
  ["dashboard", "Dashboard"],
  ["attendance", "Attendance"],
  ["leaves", "Leaves"],
  ["employees", "Employees"],
  ["departments", "Departments"],
  ["designations", "Designations"],
  ["payroll", "Payroll"],
  ["salary_slips", "Salary Slips"],
  ["projects", "Projects"],
  ["tasks", "Tasks"],
  ["reports", "Reports"],
  ["settings", "Settings"],
];

const roles = ["admin", "manager", "employee"];

export default function RolesPermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadPermissions() {
    try {
      setLoading(true);
      const data = await fetchPermissions();
      setPermissions(data.permissions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPermissions();
  }, []);

  const map = useMemo(() => {
    const obj = {};
    permissions.forEach((item) => {
      obj[`${item.role}_${item.module_key}`] = item.can_access;
    });
    return obj;
  }, [permissions]);

  function togglePermission(role, module_key) {
    setPermissions((prev) => {
      const exists = prev.find(
        (p) => p.role === role && p.module_key === module_key
      );

      if (exists) {
        return prev.map((p) =>
          p.role === role && p.module_key === module_key
            ? { ...p, can_access: !p.can_access }
            : p
        );
      }

      return [...prev, { role, module_key, can_access: true }];
    });
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      await savePermissions({ permissions });

      setMessage("Permissions saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="dashboard-card">Loading permissions...</div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Roles & Permissions</h1>
          <p>Control module access for Admin, Manager and Employee roles.</p>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-success">{message}</div>}

      <div className="dashboard-card">
        <div className="permission-table">
          <div className="permission-head">
            <span>Module</span>
            <span>Admin</span>
            <span>Manager</span>
            <span>Employee</span>
          </div>

          {modules.map(([moduleKey, label]) => (
            <div className="permission-row" key={moduleKey}>
              <span>{label}</span>

              {roles.map((role) => (
                <label key={role}>
                  <input
                    type="checkbox"
                    checked={Boolean(map[`${role}_${moduleKey}`])}
                    onChange={() => togglePermission(role, moduleKey)}
                  />
                </label>
              ))}
            </div>
          ))}
        </div>

        <div className="employee-submit-wrap">
          <button className="login-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      </div>
    </div>
  );
}