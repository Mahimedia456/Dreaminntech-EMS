import { useEffect, useState } from "react";
import {
  BadgeDollarSign,
  Download,
  Eye,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  deletePayroll,
  downloadPayrollPdf,
  fetchPayroll,
  generatePayroll,
  markPayrollPaid,
  updatePayroll,
} from "../../services/payrollApi";
import PayrollGenerateModal from "../../components/payroll/PayrollGenerateModal";
import PayrollViewModal from "../../components/payroll/PayrollViewModal";
import PayrollEditModal from "../../components/payroll/PayrollEditModal";
import { getAuthUser } from "../../utils/auth";

function money(value = 0) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

export default function PayrollPage() {
  const user = getAuthUser();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const isAdmin = user.role === "admin";

  async function loadPayroll() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchPayroll();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(payload) {
    try {
      setError("");
      await generatePayroll(payload);
      setGenerateOpen(false);
      loadPayroll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePaid(id) {
    try {
      await markPayrollPaid(id);
      loadPayroll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(payload) {
    try {
      await updatePayroll(editItem.id, payload);
      setEditItem(null);
      loadPayroll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this payroll record?")) return;

    try {
      await deletePayroll(id);
      loadPayroll();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadPayroll();
  }, []);

  const filtered = items.filter((item) => {
    const keyword = search.toLowerCase();
    return (
      item.full_name?.toLowerCase().includes(keyword) ||
      item.employee_code?.toLowerCase().includes(keyword) ||
      item.department?.toLowerCase().includes(keyword)
    );
  });

  const totalPayroll = filtered.reduce((s, i) => s + Number(i.net_salary || 0), 0);
  const totalDeductions = filtered.reduce(
    (s, i) => s + Number(i.total_deductions || 0),
    0
  );
  const pending = filtered.filter((i) => i.status !== "paid").length;

  return (
    <div>
      <div className="dashboard-header employees-header">
        <div>
          <h1>Payroll Management</h1>
          <p>
            {isAdmin
              ? "Employee salaries, deductions, allowances and payslips."
              : "View your salary, deductions and payslips."}
          </p>
        </div>

        {isAdmin && (
          <button className="employee-add-btn" onClick={() => setGenerateOpen(true)}>
            <Plus size={18} />
            Generate Payroll
          </button>
        )}
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="stats-grid">
        <PayrollStat title="Payroll" value={money(totalPayroll)} icon={Wallet} />
        <PayrollStat title="Records" value={filtered.length} icon={BadgeDollarSign} />
        <PayrollStat title="Deductions" value={money(totalDeductions)} icon={FileText} />
        <PayrollStat title="Pending Payslips" value={pending} icon={Download} />
      </div>

      <div className="dashboard-card">
        <div className="salary-toolbar">
          <div className="salary-search">
            <input
              placeholder="Search employee, code, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <h2>Payroll Records</h2>

        {loading ? (
          <p className="text-gray-400">Loading payroll...</p>
        ) : (
          <div className="payroll-table">
            <div className="payroll-table-head">
              <span>Employee</span>
              <span>Basic Salary</span>
              <span>Deductions</span>
              <span>Allowances</span>
              <span>Net Salary</span>
              <span>Actions</span>
            </div>

            {filtered.map((item) => (
              <div className="payroll-table-row" key={item.id}>
                <span>
                  <strong>{item.full_name}</strong>
                  <small>
                    {item.employee_code} • {item.payroll_month}/{item.payroll_year} • {item.status}
                  </small>
                </span>

                <span>{money(item.basic_salary)}</span>
                <span>{money(item.total_deductions)}</span>
                <span>{money(item.total_allowances)}</span>
                <span>{money(item.net_salary)}</span>

                <div className="employee-actions">
                  <button onClick={() => setViewItem(item)} title="View">
                    <Eye size={14} />
                  </button>

                  <button onClick={() => downloadPayrollPdf(item.id)} title="PDF">
                    PDF
                  </button>

                  {isAdmin && (
                    <>
                      <button onClick={() => setEditItem(item)} title="Edit">
                        <Pencil size={14} />
                      </button>

                      {item.status !== "paid" && (
                        <button onClick={() => handlePaid(item.id)}>Mark Paid</button>
                      )}

                      <button
                        className="danger"
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {!filtered.length && (
              <div className="payroll-table-row">
                <span>No payroll found</span>
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

      <div className="payroll-grid">
        <div className="dashboard-card">
          <h2>Deduction Rules</h2>

          <div className="profile-info">
            <div>
              <span>Late Deduction</span>
              <strong>Every 30 Minutes Block</strong>
            </div>

            <div>
              <span>Extra Leave Deduction</span>
              <strong>Enabled</strong>
            </div>

            <div>
              <span>Absent Rule</span>
              <strong>Per Day Salary</strong>
            </div>

            <div>
              <span>Overtime</span>
              <strong>Employee Overtime Rate</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Salary Formula</h2>

          <div className="formula-box">
            Net Salary =
            <br />
            Basic Salary
            <br />
            + Allowances
            <br />
            + Overtime
            <br />
            - Late 30-Minute Block Deductions
            <br />
            - Leave Deductions
            <br />
            - Absent Deductions
          </div>
        </div>
      </div>

      <PayrollGenerateModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onGenerate={handleGenerate}
      />

      <PayrollViewModal
        open={Boolean(viewItem)}
        item={viewItem}
        onClose={() => setViewItem(null)}
      />

      <PayrollEditModal
        open={Boolean(editItem)}
        item={editItem}
        onClose={() => setEditItem(null)}
        onSubmit={handleUpdate}
      />
    </div>
  );
}

function PayrollStat({ title, value, icon: Icon }) {
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