import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  name: "",
  code: "",
  description: "",
  status: "active",
};

export default function DepartmentModal({ open, onClose, onSubmit, selected }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name || "",
        code: selected.code || "",
        description: selected.description || "",
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
            <h2>{selected ? "Edit Department" : "Add Department"}</h2>
            <p>Manage company department information.</p>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="checkout-body">
          <div className="employee-form-grid">
            <div>
              <label>Department Name</label>
              <input value={form.name} required onChange={(e) => updateField("name", e.target.value)} />
            </div>

            <div>
              <label>Code</label>
              <input value={form.code} onChange={(e) => updateField("code", e.target.value)} />
            </div>

            <div>
              <label>Status</label>
              <select value={form.status} onChange={(e) => updateField("status", e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="checkout-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="login-btn">
            {selected ? "Update Department" : "Create Department"}
          </button>
        </div>
      </form>
    </div>
  );
}
