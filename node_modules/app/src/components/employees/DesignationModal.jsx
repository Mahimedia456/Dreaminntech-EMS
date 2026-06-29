import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  department_id: "",
  name: "",
  description: "",
  status: "active",
};

export default function DesignationModal({
  open,
  onClose,
  onSubmit,
  selected,
  departments,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (selected) {
      setForm({
        department_id: selected.department_id || "",
        name: selected.name || "",
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
            <h2>{selected ? "Edit Designation" : "Add Designation"}</h2>
            <p>Manage employee job title and department mapping.</p>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="checkout-body">
          <div className="employee-form-grid">
            <div>
              <label>Designation Name</label>
              <input value={form.name} required onChange={(e) => updateField("name", e.target.value)} />
            </div>

            <div>
              <label>Department</label>
              <select
                value={form.department_id}
                onChange={(e) => updateField("department_id", e.target.value)}
              >
                <option value="">Select Department</option>
                {departments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
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
            {selected ? "Update Designation" : "Create Designation"}
          </button>
        </div>
      </form>
    </div>
  );
}