import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  medical_allowance: 0,
  fuel_allowance: 0,
  food_allowance: 0,
  overtime_amount: 0,
  late_deduction: 0,
  absent_deduction: 0,
  leave_deduction: 0,
  note: "",
  status: "generated",
};

export default function PayrollEditModal({ open, item, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (item) {
      setForm({
        medical_allowance: item.medical_allowance || 0,
        fuel_allowance: item.fuel_allowance || 0,
        food_allowance: item.food_allowance || 0,
        overtime_amount: item.overtime_amount || 0,
        late_deduction: item.late_deduction || 0,
        absent_deduction: item.absent_deduction || 0,
        leave_deduction: item.leave_deduction || 0,
        note: item.note || "",
        status: item.status || "generated",
      });
    } else {
      setForm(initialForm);
    }
  }, [item, open]);

  if (!open || !item) return null;

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
            <h2>Edit Payroll</h2>
            <p>{item.full_name}</p>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="checkout-body">
          <div className="employee-form-grid">
            <Field
              label="Medical Allowance"
              value={form.medical_allowance}
              onChange={(v) => updateField("medical_allowance", v)}
            />

            <Field
              label="Fuel Allowance"
              value={form.fuel_allowance}
              onChange={(v) => updateField("fuel_allowance", v)}
            />

            <Field
              label="Food Allowance"
              value={form.food_allowance}
              onChange={(v) => updateField("food_allowance", v)}
            />

            <Field
              label="Overtime Amount"
              value={form.overtime_amount}
              onChange={(v) => updateField("overtime_amount", v)}
            />

            <Field
              label="Late Deduction"
              value={form.late_deduction}
              onChange={(v) => updateField("late_deduction", v)}
            />

            <Field
              label="Absent Deduction"
              value={form.absent_deduction}
              onChange={(v) => updateField("absent_deduction", v)}
            />

            <Field
              label="Leave Deduction"
              value={form.leave_deduction}
              onChange={(v) => updateField("leave_deduction", v)}
            />

            <div>
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="generated">Generated</option>
                <option value="paid">Paid</option>
                <option value="hold">Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label>Note / Warning</label>
              <textarea
                value={form.note}
                onChange={(e) => updateField("note", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="checkout-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="login-btn">
            Save Payroll
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label>{label}</label>
      <input
        type="number"
        value={value || 0}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
