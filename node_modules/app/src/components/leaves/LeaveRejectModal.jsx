import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function LeaveRejectModal({ open, onClose, onSubmit, selected }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ rejection_reason: reason });
  }

  return (
    <div className="modal-overlay">
      <form className="checkout-modal" onSubmit={handleSubmit}>
        <div className="checkout-header">
          <div>
            <h2>Reject Leave</h2>
            <p>
              {selected?.employee_name
                ? `Reject leave request for ${selected.employee_name}.`
                : "Reject leave request."}
            </p>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="checkout-body">
          <div className="checkout-field">
            <label>Rejection Reason</label>
            <textarea
              required
              value={reason}
              placeholder="Write rejection reason..."
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="checkout-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="login-btn">
            Reject Leave
          </button>
        </div>
      </form>
    </div>
  );
}