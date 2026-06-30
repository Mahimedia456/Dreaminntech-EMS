import React, { useState } from "react";
import { X } from "lucide-react";

export default function ExpenseReviewModal({ open, expense, onClose, onSubmit }) {
  const [form, setForm] = useState({
    status: "under_review",
    remarks: "",
  });

  if (!open || !expense) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="modal-overlay">
      <form className="checkout-modal" onSubmit={handleSubmit}>
        <div className="checkout-header">
          <div>
            <h2>Review Expense</h2>
            <p>{expense.expense_no} • {expense.title}</p>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="checkout-body">
          <div className="leave-form">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="need_correction">Need Correction</option>
              <option value="paid">Paid</option>
            </select>

            <label>Remarks / Feedback</label>
            <textarea
              required
              placeholder="Write feedback or approval remarks..."
              value={form.remarks}
              onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
            />
          </div>
        </div>

        <div className="checkout-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="login-btn">
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
}
