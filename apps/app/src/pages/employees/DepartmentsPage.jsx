import React, { useEffect, useState } from "react";
import { Building2, Plus } from "lucide-react";
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
} from "../../services/employeesApi";
import DepartmentModal from "../../components/employees/DepartmentModal";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  async function loadDepartments() {
    try {
      setLoading(true);
      const data = await fetchDepartments();
      setDepartments(data.departments || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(payload) {
    try {
      setError("");

      if (selected) {
        await updateDepartment(selected.id, payload);
      } else {
        await createDepartment(payload);
      }

      setModalOpen(false);
      setSelected(null);
      loadDepartments();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this department?")) return;

    try {
      await deleteDepartment(id);
      loadDepartments();
    } catch (err) {
      setError(err.message);
    }
  }

  function openCreate() {
    setSelected(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setSelected(item);
    setModalOpen(true);
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  const totalEmployees = departments.reduce(
    (sum, item) => sum + Number(item.employees_count || 0),
    0
  );

  return (
    <div>
      <div className="dashboard-header employees-header">
        <div>
          <h1>Departments</h1>
          <p>Manage company departments.</p>
        </div>

        <button className="employee-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Department
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="stats-grid">
        <DepartmentStat title="Total Departments" value={departments.length} />
        <DepartmentStat title="Employees" value={totalEmployees} />
        <DepartmentStat title="Active Departments" value={departments.filter((d) => d.status === "active").length} />
        <DepartmentStat title="Inactive" value={departments.filter((d) => d.status === "inactive").length} />
      </div>

      <div className="dashboard-card">
        {loading ? (
          <p className="text-gray-400">Loading departments...</p>
        ) : (
          <div className="employee-table">
            <div className="department-row department-row-head">
              <span>Department</span>
              <span>Code</span>
              <span>Employees</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {departments.map((item) => (
              <div className="department-row" key={item.id}>
                <span>{item.name}</span>
                <span>{item.code || "-"}</span>
                <span>{item.employees_count || 0}</span>
                <span>{item.status}</span>

                <div className="employee-actions">
                  <button onClick={() => openEdit(item)}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(item.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DepartmentModal
        open={modalOpen}
        selected={selected}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function DepartmentStat({ title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Building2 size={22} />
      </div>
      <div>
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
}
