import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  name: "",
  start_time: "09:00",
  end_time: "18:00",
  break_minutes: 60,
  grace_minutes: 15,
  late_deduction_type: "per_minute",
  status: "active",
};

function cleanTime(value) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

export default function ShiftModal({ open, onClose, onSubmit, selected }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name || "",
        start_time: cleanTime(selected.start_time) || "09:00",
        end_time: cleanTime(selected.end_time) || "18:00",
        break_minutes: selected.break_minutes || 60,
        grace_minutes: selected.grace_minutes || 15,
        late_deduction_type: selected.late_deduction_type || "per_minute",
        status: selected.status || "active",
      });
    } else {
      setForm(initialForm);
    }
  }, [selected, open]);

  if (!open) return null;

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="modal-overlay">
      <form className="checkout-modal" onSubmit={handleSubmit}>
        <div className="checkout-header">
          <div>
            <h2>{selected ? "Edit Shift" : "Add Shift"}</h2>
            <p>Manage office timings, grace minutes and deduction rules.</p>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="checkout-body">
          <div className="employee-form-grid">
            <div>
              <label>Shift Name</label>
              <input value={form.name} required onChange={(e) => updateField("name", e.target.value)} />
            </div>

            <div>
              <label>Start Time</label>
              <input type="time" value={form.start_time} onChange={(e) => updateField("start_time", e.target.value)} />
            </div>

            <div>
              <label>End Time</label>
              <input type="time" value={form.end_time} onChange={(e) => updateField("end_time", e.target.value)} />
            </div>

            <div>
              <label>Break Minutes</label>
              <input type="number" value={form.break_minutes} onChange={(e) => updateField("break_minutes", e.target.value)} />
            </div>

            <div>
              <label>Grace Minutes</label>
              <input type="number" value={form.grace_minutes} onChange={(e) => updateField("grace_minutes", e.target.value)} />
            </div>

            <div>
              <label>Late Deduction Type</label>
              <select
                value={form.late_deduction_type}
                onChange={(e) => updateField("late_deduction_type", e.target.value)}
              >
                <option value="none">None</option>
                <option value="fixed">Fixed</option>
                <option value="per_minute">Per Minute</option>
                <option value="per_hour">Per Hour</option>
              </select>
            </div>

            <div>
              <label>Status</label>
              <select value={form.status} onChange={(e) => updateField("status", e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="checkout-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="login-btn">
            {selected ? "Update Shift" : "Create Shift"}
          </button>
        </div>
      </form>
    </div>
  );
}