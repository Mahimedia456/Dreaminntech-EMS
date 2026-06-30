import React, { useState } from "react";
import { X } from "lucide-react";

export default function PayrollGenerateModal({ open, onClose, onGenerate }) {
  const now = new Date();

  const [form, setForm] = useState({
    payroll_month: now.getMonth() + 1,
    payroll_year: now.getFullYear(),
  });

  if (!open) return null;

  function submit(e) {
    e.preventDefault();

    onGenerate({
      payroll_month: Number(form.payroll_month),
      payroll_year: Number(form.payroll_year),
      title: `Payroll ${form.payroll_month}/${form.payroll_year}`,
    });
  }

  return (
    <div className="modal-overlay">
      <form className="checkout-modal" onSubmit={submit}>
        <div className="checkout-header">
          <div>
            <h2>Generate Payroll</h2>
            <p>Select month and year to calculate payroll.</p>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="checkout-body">
          <div className="employee-form-grid">
            <div>
              <label>Month</label>
              <select
                value={form.payroll_month}
                onChange={(e) =>
                  setForm((p) => ({ ...p, payroll_month: e.target.value }))
                }
              >
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Year</label>
              <input
                type="number"
                value={form.payroll_year}
                onChange={(e) =>
                  setForm((p) => ({ ...p, payroll_year: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="checkout-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="login-btn" type="submit">
            Generate Payroll
          </button>
        </div>
      </form>
    </div>
  );
}
