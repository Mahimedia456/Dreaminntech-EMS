import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  leave_type_id: "",
  start_date: "",
  end_date: "",
  reason: "",
};

export default function LeaveRequestModal({
  open,
  onClose,
  onSubmit,
  leaveTypes,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (open) setForm(initialForm);
  }, [open]);

  if (!open) return null;

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
            <h2>Request Leave</h2>
            <p>Submit your leave request for approval.</p>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="checkout-body">
          <div className="employee-form-grid">
            <div>
              <label>Leave Type</label>
              <select
                value={form.leave_type_id}
                required
                onChange={(e) => updateField("leave_type_id", e.target.value)}
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>From Date</label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => updateField("start_date", e.target.value)}
              />
            </div>

            <div>
              <label>To Date</label>
              <input
                type="date"
                required
                value={form.end_date}
                onChange={(e) => updateField("end_date", e.target.value)}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label>Reason</label>
              <textarea
                value={form.reason}
                required
                placeholder="Write your leave reason..."
                onChange={(e) => updateField("reason", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="checkout-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="login-btn">
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}
