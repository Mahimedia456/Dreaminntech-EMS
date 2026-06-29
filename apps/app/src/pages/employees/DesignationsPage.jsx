import { useEffect, useState } from "react";
import { BadgeCheck, Plus } from "lucide-react";
import {
  createDesignation,
  deleteDesignation,
  fetchDepartments,
  fetchDesignations,
  updateDesignation,
} from "../../services/employeesApi";
import DesignationModal from "../../components/employees/DesignationModal";

export default function DesignationsPage() {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  async function loadDesignations() {
    try {
      setLoading(true);
      const [designationsRes, departmentsRes] = await Promise.all([
        fetchDesignations(),
        fetchDepartments(),
      ]);

      setDesignations(designationsRes.designations || []);
      setDepartments(departmentsRes.departments || []);
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
        await updateDesignation(selected.id, payload);
      } else {
        await createDesignation(payload);
      }

      setModalOpen(false);
      setSelected(null);
      loadDesignations();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this designation?")) return;

    try {
      await deleteDesignation(id);
      loadDesignations();
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
    loadDesignations();
  }, []);

  return (
    <div>
      <div className="dashboard-header employees-header">
        <div>
          <h1>Designations</h1>
          <p>Manage employee job titles and positions.</p>
        </div>

        <button className="employee-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Designation
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="stats-grid">
        <DesignationStat title="Total Designations" value={designations.length} />
        <DesignationStat title="Assigned Employees" value={designations.reduce((s, i) => s + Number(i.employees_count || 0), 0)} />
        <DesignationStat title="Active" value={designations.filter((d) => d.status === "active").length} />
        <DesignationStat title="Departments" value={new Set(designations.map((d) => d.department).filter(Boolean)).size} />
      </div>

      <div className="dashboard-card">
        {loading ? (
          <p className="text-gray-400">Loading designations...</p>
        ) : (
          <div className="employee-table">
            <div className="department-row department-row-head">
              <span>Designation</span>
              <span>Department</span>
              <span>Employees</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {designations.map((item) => (
              <div className="department-row" key={item.id}>
                <span>{item.name}</span>
                <span>{item.department || "-"}</span>
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

      <DesignationModal
        open={modalOpen}
        selected={selected}
        departments={departments}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function DesignationStat({ title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <BadgeCheck size={22} />
      </div>
      <div>
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
}