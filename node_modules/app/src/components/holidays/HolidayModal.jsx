import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  title: "",
  holiday_date: "",
  holiday_type: "public",
  description: "",
  is_paid: true,
  status: "active",
};

export default function HolidayModal({
  open,
  selected,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (selected) {
      setForm({
        title: selected.title || "",
        holiday_date: selected.holiday_date || "",
        holiday_type: selected.holiday_type || "public",
        description: selected.description || "",
        is_paid: selected.is_paid ?? true,
        status: selected.status || "active",
      });
    } else {
      setForm(initialForm);
    }
  }, [selected, open]);

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
            <h2>
              {selected ? "Edit Holiday" : "Add Holiday"}
            </h2>
            <p>Manage company holidays.</p>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="checkout-body">
          <div className="employee-form-grid">
            <div>
              <label>Holiday Title</label>
              <input
                required
                value={form.title}
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
              />
            </div>

            <div>
              <label>Date</label>
              <input
                type="date"
                required
                value={form.holiday_date}
                onChange={(e) =>
                  updateField(
                    "holiday_date",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label>Holiday Type</label>

              <select
                value={form.holiday_type}
                onChange={(e) =>
                  updateField(
                    "holiday_type",
                    e.target.value
                  )
                }
              >
                <option value="public">
                  Public Holiday
                </option>

                <option value="company">
                  Company Holiday
                </option>

                <option value="optional">
                  Optional Holiday
                </option>
              </select>
            </div>

            <div>
              <label>Status</label>

              <select
                value={form.status}
                onChange={(e) =>
                  updateField("status", e.target.value)
                }
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div>
              <label>Paid Holiday</label>

              <select
                value={String(form.is_paid)}
                onChange={(e) =>
                  updateField(
                    "is_paid",
                    e.target.value === "true"
                  )
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
              }}
            >
              <label>Description</label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="checkout-footer">
          <button
            type="button"
            className="secondary-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="login-btn"
          >
            {selected
              ? "Update Holiday"
              : "Create Holiday"}
          </button>
        </div>
      </form>
    </div>
  );
}