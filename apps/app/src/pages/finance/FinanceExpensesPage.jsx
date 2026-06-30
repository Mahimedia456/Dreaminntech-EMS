import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  Eye,
  FileSpreadsheet,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAuthUser } from "../../utils/auth";
import {
  createFinanceExpense,
  deleteFinanceExpense,
  fetchFinanceCategories,
  fetchFinanceExpenses,
  reviewFinanceExpense,
  submitFinanceExpense,
  updateFinanceExpense,
} from "../../services/financeExpensesApi";
import ExpenseFormModal from "../../components/finance/ExpenseFormModal";
import ExpenseReviewModal from "../../components/finance/ExpenseReviewModal";

const months = [
  { value: "all", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const statuses = [
  "all",
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "need_correction",
  "paid",
  "cancelled",
];

function money(value = 0) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 10);
}

function isUmair(user) {
  return String(user?.email || "").toLowerCase() === "umairawan@mahimediasolutions.com";
}

function isShahid(user) {
  return String(user?.email || "").toLowerCase() === "shahid@mahimediasolutions.com";
}

export default function FinanceExpensesPage() {
  const user = getAuthUser();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    status: "all",
    categoryId: "all",
    q: "",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewExpense, setReviewExpense] = useState(null);

  const canCreate = isUmair(user);
  const canReview = isShahid(user);

  function updateFilter(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function loadMeta() {
    const data = await fetchFinanceCategories();
    setCategories(data.categories || []);
  }

  async function loadExpenses() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchFinanceExpenses(filters);
      setExpenses(data.expenses || []);
      setSummary(data.summary || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setSelectedExpense(null);
    setFormOpen(true);
  }

  function openEdit(expense) {
    setSelectedExpense(expense);
    setFormOpen(true);
  }

  async function handleSubmit(payload) {
    try {
      setError("");

      if (selectedExpense) {
        await updateFinanceExpense(selectedExpense.id, payload);
      } else {
        await createFinanceExpense(payload);
      }

      setFormOpen(false);
      setSelectedExpense(null);
      loadExpenses();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(expense) {
    if (!window.confirm("Delete this expense?")) return;

    try {
      setError("");
      await deleteFinanceExpense(expense.id);
      loadExpenses();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmitExpense(expense) {
    try {
      setError("");
      await submitFinanceExpense(expense.id);
      loadExpenses();
    } catch (err) {
      setError(err.message);
    }
  }

  function openReview(expense) {
    setReviewExpense(expense);
    setReviewOpen(true);
  }

  async function handleReview(payload) {
    try {
      setError("");
      await reviewFinanceExpense(reviewExpense.id, payload);
      setReviewOpen(false);
      setReviewExpense(null);
      loadExpenses();
    } catch (err) {
      setError(err.message);
    }
  }

  function exportCsv() {
    if (!expenses.length) return;

    const headers = [
      "expense_no",
      "title",
      "category_name",
      "vendor",
      "invoice_number",
      "bill_number",
      "expense_date",
      "payment_method",
      "amount",
      "tax",
      "discount",
      "total",
      "currency",
      "status",
      "created_by_email",
    ];

    const csv = [
      headers.join(","),
      ...expenses.map((row) =>
        headers
          .map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-expenses-${filters.year}-${filters.month}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  function printPage() {
    window.print();
  }

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [filters.month, filters.year, filters.status, filters.categoryId]);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return [current - 2, current - 1, current, current + 1];
  }, []);

  return (
    <div>
      <div className="dashboard-header employees-header">
        <div>
          <h1>Finance Expenses</h1>
          <p>Salary expenses, bills, rent, invoices and company expenses.</p>
        </div>

        <div className="finance-header-actions">
          <button className="filter-btn" onClick={exportCsv}>
            <Download size={16} />
            CSV
          </button>

          <button className="filter-btn" onClick={printPage}>
            <FileSpreadsheet size={16} />
            Print / PDF
          </button>

          {canCreate && (
            <button className="employee-add-btn" onClick={openCreate}>
              <Plus size={18} />
              Add Expense
            </button>
          )}
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="stats-grid">
        <FinanceStat title="Total Amount" value={money(summary.total_amount)} icon={Wallet} />
        <FinanceStat title="Submitted" value={summary.submitted || 0} icon={Send} />
        <FinanceStat title="Under Review" value={summary.under_review || 0} icon={Eye} />
        <FinanceStat title="Approved" value={summary.approved || 0} icon={FileSpreadsheet} />
        <FinanceStat title="Rejected" value={summary.rejected || 0} icon={Trash2} />
        <FinanceStat title="Paid" value={summary.paid || 0} icon={Wallet} />
      </div>

      <div className="dashboard-card">
        <div className="finance-toolbar">
          <div className="salary-search">
            <Search size={18} />
            <input
              placeholder="Search expense no, title, vendor, invoice..."
              value={filters.q}
              onChange={(e) => updateFilter("q", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") loadExpenses();
              }}
            />
          </div>

          <select value={filters.month} onChange={(e) => updateFilter("month", e.target.value)}>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select value={filters.year} onChange={(e) => updateFilter("year", e.target.value)}>
            <option value="all">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>

          <select
            value={filters.categoryId}
            onChange={(e) => updateFilter("categoryId", e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button className="filter-btn" onClick={loadExpenses}>
            Search
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading finance expenses...</p>
        ) : (
          <div className="finance-table">
            <div className="finance-table-head">
              <span>Expense</span>
              <span>Category</span>
              <span>Vendor</span>
              <span>Date</span>
              <span>Total</span>
              <span>Status</span>
              <span>Files</span>
              <span>Actions</span>
            </div>

            {expenses.map((expense) => (
              <div className="finance-table-row" key={expense.id}>
                <span>
                  <strong>{expense.expense_no}</strong>
                  <small>{expense.title}</small>
                </span>

                <span>{expense.category_name || "-"}</span>
                <span>{expense.vendor || "-"}</span>
                <span>{formatDate(expense.expense_date)}</span>
                <span>{money(expense.total)}</span>
                <span className={`finance-status status-${expense.status}`}>
                  {expense.status.replaceAll("_", " ")}
                </span>
                <span>{expense.files_count || 0}</span>

                <div className="employee-actions">
                  <Link to={`/finance-expenses/${expense.id}`}>
                    <Eye size={14} />
                  </Link>

                  {canCreate && !["approved", "paid"].includes(expense.status) && (
                    <button onClick={() => openEdit(expense)}>
                      <Pencil size={14} />
                    </button>
                  )}

                  {canCreate && ["draft", "need_correction", "rejected"].includes(expense.status) && (
                    <button onClick={() => handleSubmitExpense(expense)}>
                      <Send size={14} />
                    </button>
                  )}

                  {canReview && (
                    <button onClick={() => openReview(expense)}>
                      Review
                    </button>
                  )}

                  {canCreate && ["draft", "need_correction", "rejected"].includes(expense.status) && (
                    <button className="danger" onClick={() => handleDelete(expense)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {!expenses.length && (
              <div className="finance-table-row">
                <span>No expenses found</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
              </div>
            )}
          </div>
        )}
      </div>

      <ExpenseFormModal
        open={formOpen}
        selected={selectedExpense}
        onClose={() => {
          setFormOpen(false);
          setSelectedExpense(null);
        }}
        onSubmit={handleSubmit}
      />

      <ExpenseReviewModal
        open={reviewOpen}
        expense={reviewExpense}
        onClose={() => {
          setReviewOpen(false);
          setReviewExpense(null);
        }}
        onSubmit={handleReview}
      />
    </div>
  );
}

function FinanceStat({ title, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <div>
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
}
