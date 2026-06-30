import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  DollarSign,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { getAuthUser } from "../../utils/auth";
import { deleteEmployee, fetchEmployees } from "../../services/employeesApi";

export default function EmployeesPage() {
  const user = getAuthUser();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchEmployees();
      setEmployees(data.employees || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm("Delete this employee?");
    if (!confirmDelete) return;

    try {
      await deleteEmployee(id);
      loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const departments = [
    ...new Set(employees.map((item) => item.department).filter(Boolean)),
  ];

  const filteredEmployees = employees.filter((item) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      item.full_name?.toLowerCase().includes(keyword) ||
      item.email?.toLowerCase().includes(keyword) ||
      item.employee_code?.toLowerCase().includes(keyword);

    const matchesRole = roleFilter === "all" || item.role === roleFilter;
    const matchesDepartment =
      departmentFilter === "all" || item.department === departmentFilter;

    return matchesSearch && matchesRole && matchesDepartment;
  });

  if (user.role === "employee") {
    const me = employees.find((item) => item.email === user.email);

    return (
      <div>
        <div className="dashboard-header">
          <h1>My Profile</h1>
          <p>Personal employee information.</p>
        </div>

        <div className="employee-profile-grid">
          <div className="dashboard-card">
            <div className="employee-avatar">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <h2>{user.name}</h2>
            <p className="employee-role">{me?.designation || "Employee"}</p>
          </div>

          <div className="dashboard-card">
            <div className="profile-info">
              <div>
                <span>Employee ID</span>
                <strong>{me?.employee_code || "-"}</strong>
              </div>

              <div>
                <span>Department</span>
                <strong>{me?.department || "-"}</strong>
              </div>

              <div>
                <span>Role</span>
                <strong>{user.role}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{me?.status || "active"}</strong>
              </div>

              {me?.id && (
                <div>
                  <span>Profile</span>
                  <Link to={`/employees/${me.id}`} className="table-link">
                    View Detail
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalEmployees = employees.length;
  const managers = employees.filter((item) => item.role === "manager").length;
  const payroll = employees.reduce(
    (sum, item) => sum + Number(item.basic_salary || 0),
    0
  );

  return (
    <div>
      <div className="dashboard-header employees-header">
        <div>
          <h1>{user.role === "admin" ? "Employee Management" : "Team Members"}</h1>
          <p>Manage employees, salaries, departments and roles.</p>
        </div>

        {user.role === "admin" && (
          <Link to="/employees/create" className="employee-add-btn">
            <UserPlus size={18} />
            Add Employee
          </Link>
        )}
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="stats-grid">
        <EmployeeStat title="Total Employees" value={totalEmployees} icon={Users} />
        <EmployeeStat title="Departments" value={departments.length} icon={Building2} />
        <EmployeeStat title="Managers" value={managers} icon={BriefcaseBusiness} />
        <EmployeeStat
          title="Monthly Payroll"
          value={`Rs ${payroll.toLocaleString()}`}
          icon={DollarSign}
        />
      </div>

      <div className="dashboard-card">
        <div className="employee-toolbar">
          <input
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading employees...</p>
        ) : (
          <div className="employee-table">
            <div className="employee-table-head">
              <span>Employee</span>
              <span>Department</span>
              <span>Role</span>
              <span>Salary</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {filteredEmployees.map((item) => (
              <div className="employee-table-row" key={item.id}>
                <span>
                  <strong>{item.full_name}</strong>
                  <small>{item.email}</small>
                </span>

                <span>{item.department || "-"}</span>
                <span>{item.role}</span>
                <span>Rs {Number(item.basic_salary || 0).toLocaleString()}</span>
                <span>{item.status}</span>

                <div className="employee-actions">
                  <Link to={`/employees/${item.id}`}>
                    <button>View</button>
                  </Link>

                  {user.role === "admin" && (
                    <>
                      <Link to={`/employees/${item.id}/edit`}>
                        <button>Edit</button>
                      </Link>

                      <button
                        className="danger"
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {!filteredEmployees.length && (
              <div className="employee-table-row">
                <span>No employees found</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeeStat({ title, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={22} />
      </div>

      <div>
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
}
