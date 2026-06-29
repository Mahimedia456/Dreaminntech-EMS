import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  MessageSquare,
  Send,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import { getAuthUser } from "../../utils/auth";
import {
  addFinanceExpenseFile,
  deleteFinanceExpenseFile,
  fetchFinanceExpenseDetail,
  reviewFinanceExpense,
  submitFinanceExpense,
} from "../../services/financeExpensesApi";
import ExpenseReviewModal from "../../components/finance/ExpenseReviewModal";

function money(value = 0) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 10);
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function isUmair(user) {
  return String(user?.email || "").toLowerCase() === "umairawan@mahimediasolutions.com";
}

function isShahid(user) {
  return String(user?.email || "").toLowerCase() === "shahid@mahimediasolutions.com";
}

export default function FinanceExpenseDetailPage() {
  const { id } = useParams();
  const user = getAuthUser();

  const [expense, setExpense] = useState(null);
  const [files, setFiles] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [activity, setActivity] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewOpen, setReviewOpen] = useState(false);
  const [fileForm, setFileForm] = useState({
    file_name: "",
    file_url: "",
    mime_type: "",
    file_size: 0,
    file_type: "receipt",
  });

  const canUpload = isUmair(user);
  const canReview = isShahid(user);

  async function loadDetail() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchFinanceExpenseDetail(id);

      setExpense(data.expense);
      setFiles(data.files || []);
      setFeedback(data.feedback || []);
      setActivity(data.activity || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitExpense() {
    try {
      setError("");
      await submitFinanceExpense(id);
      loadDetail();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReview(payload) {
    try {
      setError("");
      await reviewFinanceExpense(id, payload);
      setReviewOpen(false);
      loadDetail();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddFile(e) {
    e.preventDefault();

    try {
      setError("");

      await addFinanceExpenseFile(id, fileForm);

      setFileForm({
        file_name: "",
        file_url: "",
        mime_type: "",
        file_size: 0,
        file_type: "receipt",
      });

      loadDetail();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteFile(fileId) {
    if (!window.confirm("Delete this file?")) return;

    try {
      setError("");
      await deleteFinanceExpenseFile(fileId);
      loadDetail();
    } catch (err) {
      setError(err.message);
    }
  }

  function printPage() {
    window.print();
  }

  useEffect(() => {
    loadDetail();
  }, [id]);

  if (loading) {
    return <div className="dashboard-card">Loading expense detail...</div>;
  }

  if (error) {
    return <div className="auth-error">{error}</div>;
  }

  if (!expense) {
    return <div className="dashboard-card">Expense not found.</div>;
  }

  return (
    <div>
      <div className="dashboard-header employees-header">
        <div>
          <Link to="/finance-expenses" className="auth-back-link">
            <ArrowLeft size={16} />
            Back to Finance Expenses
          </Link>

          <h1>{expense.expense_no}</h1>
          <p>
            {expense.title} • {expense.category_name || "-"} •{" "}
            {expense.status?.replaceAll("_", " ")}
          </p>
        </div>

        <div className="finance-header-actions">
          <button className="filter-btn" onClick={printPage}>
            <Download size={16} />
            Print / PDF
          </button>

          {canUpload && ["draft", "need_correction", "rejected"].includes(expense.status) && (
            <button className="employee-add-btn" onClick={handleSubmitExpense}>
              <Send size={18} />
              Submit
            </button>
          )}

          {canReview && (
            <button className="employee-add-btn" onClick={() => setReviewOpen(true)}>
              <MessageSquare size={18} />
              Review
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <FinanceStat title="Amount" value={money(expense.amount)} icon={Wallet} />
        <FinanceStat title="Tax" value={money(expense.tax)} icon={FileText} />
        <FinanceStat title="Discount" value={money(expense.discount)} icon={FileText} />
        <FinanceStat title="Total" value={money(expense.total)} icon={Wallet} />
      </div>

      <div className="finance-detail-grid">
        <div className="dashboard-card">
          <h2>Expense Information</h2>

          <div className="profile-info">
            <Info label="Expense No" value={expense.expense_no} />
            <Info label="Category" value={expense.category_name || "-"} />
            <Info label="Title" value={expense.title} />
            <Info label="Vendor" value={expense.vendor || "-"} />
            <Info label="Invoice No" value={expense.invoice_number || "-"} />
            <Info label="Bill No" value={expense.bill_number || "-"} />
            <Info label="Expense Date" value={formatDate(expense.expense_date)} />
            <Info label="Payment Date" value={formatDate(expense.payment_date)} />
            <Info label="Payment Method" value={expense.payment_method || "-"} />
            <Info label="Currency" value={expense.currency || "PKR"} />
            <Info label="Created By" value={expense.created_by_name || "-"} />
            <Info label="Created Email" value={expense.created_by_email || "-"} />
            <Info label="Reviewed By" value={expense.reviewed_by_name || "-"} />
            <Info label="Approved By" value={expense.approved_by_name || "-"} />
          </div>

          <div className="task-description-box">
            <strong>Description</strong>
            <p>{expense.description || "No description added."}</p>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Status & Remarks</h2>

          <div className="profile-info">
            <Info label="Current Status" value={expense.status?.replaceAll("_", " ")} />
            <Info label="Submitted At" value={formatDateTime(expense.submitted_at)} />
            <Info label="Reviewed At" value={formatDateTime(expense.reviewed_at)} />
            <Info label="Approved At" value={formatDateTime(expense.approved_at)} />
          </div>

          <div className="task-description-box">
            <strong>Review Remarks</strong>
            <p>{expense.review_remarks || "No review remarks."}</p>
          </div>

          <div className="task-description-box">
            <strong>Approval Remarks</strong>
            <p>{expense.approval_remarks || "No approval remarks."}</p>
          </div>
        </div>
      </div>

      <div className="finance-detail-grid">
        <div className="dashboard-card">
          <h2>Receipts, Bills & Invoices</h2>

          {canUpload && (
            <form className="finance-file-form" onSubmit={handleAddFile}>
              <input
                placeholder="File name e.g. receipt.jpg"
                value={fileForm.file_name}
                onChange={(e) =>
                  setFileForm((p) => ({ ...p, file_name: e.target.value }))
                }
                required
              />

              <input
                placeholder="File URL"
                value={fileForm.file_url}
                onChange={(e) =>
                  setFileForm((p) => ({ ...p, file_url: e.target.value }))
                }
                required
              />

              <select
                value={fileForm.file_type}
                onChange={(e) =>
                  setFileForm((p) => ({ ...p, file_type: e.target.value }))
                }
              >
                <option value="receipt">Receipt</option>
                <option value="invoice">Invoice</option>
                <option value="bill">Bill</option>
                <option value="quotation">Quotation</option>
                <option value="other">Other</option>
              </select>

              <button className="login-btn">
                <Upload size={16} />
                Add File
              </button>
            </form>
          )}

          <div className="dashboard-list">
            {files.map((file) => (
              <div key={file.id}>
                <strong>
                  <FileText size={15} /> {file.file_name}
                </strong>

                <span>
                  {file.file_type} • uploaded by {file.uploaded_by_name || "-"} •{" "}
                  {formatDateTime(file.created_at)}
                </span>

                <div className="employee-actions">
                  <a href={file.file_url} target="_blank" rel="noreferrer">
                    <Eye size={14} />
                    View
                  </a>

                  <a href={file.file_url} target="_blank" rel="noreferrer" download>
                    <Download size={14} />
                    Download
                  </a>

                  {canUpload && (
                    <button
                      className="danger"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}

            {!files.length && (
              <div>
                <strong>No files uploaded</strong>
                <span>-</span>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Feedback Timeline</h2>

          <div className="dashboard-list">
            {feedback.map((item) => (
              <div key={item.id}>
                <strong>{item.full_name || "User"}</strong>
                <span>
                  {item.status?.replaceAll("_", " ")} • {formatDateTime(item.created_at)}
                </span>
                <p className="text-gray-400">{item.remarks}</p>
              </div>
            ))}

            {!feedback.length && (
              <div>
                <strong>No feedback yet</strong>
                <span>-</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h2>Activity Timeline</h2>

        <div className="dashboard-list">
          {activity.map((item) => (
            <div key={item.id}>
              <strong>{item.action}</strong>
              <span>
                {item.description} • {item.full_name || "System"} •{" "}
                {formatDateTime(item.created_at)}
              </span>
            </div>
          ))}

          {!activity.length && (
            <div>
              <strong>No activity logs</strong>
              <span>-</span>
            </div>
          )}
        </div>
      </div>

      <ExpenseReviewModal
        open={reviewOpen}
        expense={expense}
        onClose={() => setReviewOpen(false)}
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

function Info({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}