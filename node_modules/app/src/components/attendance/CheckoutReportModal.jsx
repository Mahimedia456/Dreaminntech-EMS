import { useState } from "react";
import { X } from "lucide-react";
import { submitDailyReport } from "../../services/attendanceApi";

const initialForm = {
  completed_tasks: "",
  work_summary: "",
  issues: "",
  tomorrow_plan: "",
};

export default function CheckoutReportModal({ open, onClose, onSubmitted }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await submitDailyReport(form);

      setForm(initialForm);

      if (onSubmitted) {
        onSubmitted();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <form className="checkout-modal" onSubmit={handleSubmit}>
        <div className="checkout-header">
          <div>
            <h2>Daily Work Report</h2>
            <p>Submit today&apos;s work before checkout.</p>
          </div>

          <button className="close-btn" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="checkout-body">
          {error && <div className="auth-error">{error}</div>}

          <div className="checkout-field">
            <label>Completed Tasks Today</label>
            <textarea
              value={form.completed_tasks}
              onChange={(e) => updateField("completed_tasks", e.target.value)}
              placeholder="List completed tasks..."
              required
            />
          </div>

          <div className="checkout-field">
            <label>Work Summary</label>
            <textarea
              value={form.work_summary}
              onChange={(e) => updateField("work_summary", e.target.value)}
              placeholder="Explain today's work..."
              required
            />
          </div>

          <div className="checkout-field">
            <label>Challenges / Issues</label>
            <textarea
              value={form.issues}
              onChange={(e) => updateField("issues", e.target.value)}
              placeholder="Any blockers or issues?"
            />
          </div>

          <div className="checkout-field">
            <label>Tomorrow Plan</label>
            <textarea
              value={form.tomorrow_plan}
              onChange={(e) => updateField("tomorrow_plan", e.target.value)}
              placeholder="What will you do tomorrow?"
            />
          </div>
        </div>

        <div className="checkout-footer">
          <button className="secondary-btn" type="button" onClick={onClose}>
            Cancel
          </button>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
}