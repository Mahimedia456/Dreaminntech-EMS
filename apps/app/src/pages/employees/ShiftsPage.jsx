import React, { useEffect, useState } from "react";
import { AlertTriangle, Clock3, Plus, Timer } from "lucide-react";
import {
  createShift,
  deleteShift,
  fetchShifts,
  updateShift,
} from "../../services/employeesApi";
import ShiftModal from "../../components/employees/ShiftModal";

function formatTime(time) {
  if (!time) return "-";
  const [hours, minutes] = String(time).split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes));
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  async function loadShifts() {
    try {
      setLoading(true);
      const data = await fetchShifts();
      setShifts(data.shifts || []);
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
        await updateShift(selected.id, payload);
      } else {
        await createShift(payload);
      }

      setModalOpen(false);
      setSelected(null);
      loadShifts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this shift?")) return;

    try {
      await deleteShift(id);
      loadShifts();
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
    loadShifts();
  }, []);

  const totalEmployees = shifts.reduce(
    (sum, item) => sum + Number(item.employees_count || 0),
    0
  );

  return (
    <div>
      <div className="dashboard-header employees-header">
        <div>
          <h1>Shifts Management</h1>
          <p>Manage office shifts, working hours and late rules.</p>
        </div>

        <button className="employee-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Shift
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="stats-grid">
        <ShiftStat title="Total Shifts" value={shifts.length} icon={Clock3} />
        <ShiftStat title="Active Employees" value={totalEmployees} icon={Timer} />
        <ShiftStat title="Grace Minutes" value={shifts[0]?.grace_minutes || 0} icon={Clock3} />
        <ShiftStat title="Late Rules" value="Enabled" icon={AlertTriangle} />
      </div>

      <div className="dashboard-card">
        <h2>Office Shifts</h2>

        {loading ? (
          <p className="text-gray-400">Loading shifts...</p>
        ) : (
          <div className="shift-grid">
            {shifts.map((shift) => (
              <div className="shift-card" key={shift.id}>
                <div className="shift-icon">
                  <Clock3 size={24} />
                </div>

                <h3>{shift.name}</h3>
                <p>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</p>

                <div className="shift-info">
                  <div>
                    <span>Grace Time</span>
                    <strong>{shift.grace_minutes} Minutes</strong>
                  </div>

                  <div>
                    <span>Break Time</span>
                    <strong>{shift.break_minutes} Minutes</strong>
                  </div>

                  <div>
                    <span>Employees</span>
                    <strong>{shift.employees_count || 0}</strong>
                  </div>

                  <div>
                    <span>Late Rule</span>
                    <strong>{shift.late_deduction_type}</strong>
                  </div>
                </div>

                <div className="shift-actions">
                  <button onClick={() => openEdit(shift)}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(shift.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ShiftModal
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

function ShiftStat({ title, value, icon: Icon }) {
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
