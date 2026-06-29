import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { fetchFinanceCategories } from "../../services/financeExpensesApi";

const initialForm = {
  category_id: "",
  title: "",
  description: "",
  vendor: "",
  invoice_number: "",
  bill_number: "",
  expense_date: new Date().toISOString().slice(0, 10),
  payment_date: "",
  payment_method: "cash",
  amount: 0,
  tax: 0,
  discount: 0,
  currency: "PKR",
  status: "draft",
};

export default function ExpenseFormModal({ open, selected, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);

  async function loadCategories() {
    const data = await fetchFinanceCategories();
    setCategories(data.categories || []);
  }

  useEffect(() => {
    if (open) loadCategories();
  }, [open]);

  useEffect(() => {
    if (selected) {
      setForm({
        category_id: selected.category_id || "",
        title: selected.title || "",
        description: selected.description || "",
        vendor: selected.vendor || "",
        invoice_number: selected.invoice_number || "",
        bill_number: selected.bill_number || "",
        expense_date: String(selected.expense_date || "").slice(0, 10),
        payment_date: selected.payment_date ? String(selected.payment_date).slice(0, 10) : "",
        payment_method: selected.payment_method || "cash",
        amount: selected.amount || 0,
        tax: selected.tax || 0,
        discount: selected.discount || 0,
        currency: selected.currency || "PKR",
        status: selected.status || "draft",
      });
    } else {
      setForm(initialForm);
    }
  }, [selected, open]);

  if (!open) return null;

  const total =
    Number(form.amount || 0) + Number(form.tax || 0) - Number(form.discount || 0);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ ...form, total });
  }

  return (
    <div className="modal-overlay">
      <form className="checkout-modal" onSubmit={handleSubmit}>
        <div className="checkout-header">
          <div>
            <h2>{selected ? "Edit Expense" : "Create Expense"}</h2>
            <p>Salary, bills, rent, invoices and company expenses.</p>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="checkout-body">
          <div className="employee-form-grid">
            <div>
              <label>Category</label>
              <select
                required
                value={form.category_id}
                onChange={(e) => updateField("category_id", e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <Field label="Title" required value={form.title} onChange={(v) => updateField("title", v)} />
            <Field label="Vendor" value={form.vendor} onChange={(v) => updateField("vendor", v)} />
            <Field label="Invoice No" value={form.invoice_number} onChange={(v) => updateField("invoice_number", v)} />
            <Field label="Bill No" value={form.bill_number} onChange={(v) => updateField("bill_number", v)} />
            <Field label="Expense Date" type="date" value={form.expense_date} onChange={(v) => updateField("expense_date", v)} />
            <Field label="Payment Date" type="date" value={form.payment_date} onChange={(v) => updateField("payment_date", v)} />

            <div>
              <label>Payment Method</label>
              <select
                value={form.payment_method}
                onChange={(e) => updateField("payment_method", e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Field label="Amount" type="number" value={form.amount} onChange={(v) => updateField("amount", v)} />
            <Field label="Tax" type="number" value={form.tax} onChange={(v) => updateField("tax", v)} />
            <Field label="Discount" type="number" value={form.discount} onChange={(v) => updateField("discount", v)} />
            <Field label="Currency" value={form.currency} onChange={(v) => updateField("currency", v)} />

            <div>
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>

            <div>
              <label>Total</label>
              <input value={total} readOnly />
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
            {selected ? "Update Expense" : "Create Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label>{label}</label>
      <input
        required={required}
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}