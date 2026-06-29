import { X, Download } from "lucide-react";
import { downloadPayrollPdf } from "../../services/payrollApi";

function money(value = 0) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

export default function PayrollViewModal({ open, item, onClose }) {
  if (!open || !item) return null;

  return (
    <div className="modal-overlay">
      <div className="checkout-modal">
        <div className="checkout-header">
          <div>
            <h2>Payroll Detail</h2>
            <p>
              {item.full_name} • {item.payroll_month}/{item.payroll_year}
            </p>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="checkout-body">
          <div className="salary-preview">
            <Info label="Employee" value={item.full_name} />
            <Info label="Employee Code" value={item.employee_code} />
            <Info label="Department" value={item.department || "-"} />
            <Info label="Status" value={item.status} />

            <Info label="Basic Salary" value={money(item.basic_salary)} />
            <Info label="Medical Allowance" value={money(item.medical_allowance)} />
            <Info label="Fuel Allowance" value={money(item.fuel_allowance)} />
            <Info label="Food Allowance" value={money(item.food_allowance)} />

            <Info label="Present Days" value={item.present_days || 0} />
            <Info label="Absent Days" value={item.absent_days || 0} />
            <Info label="Late Days" value={item.late_days || 0} />
            <Info label="Late Minutes" value={item.late_minutes || 0} />

            <Info label="Overtime Amount" value={money(item.overtime_amount)} />
            <Info label="Late Deduction" value={money(item.late_deduction)} />
            <Info label="Absent Deduction" value={money(item.absent_deduction)} />
            <Info label="Leave Deduction" value={money(item.leave_deduction)} />

            <Info label="Gross Salary" value={money(item.gross_salary)} />
            <Info label="Total Deductions" value={money(item.total_deductions)} />
            <Info label="Net Salary" value={money(item.net_salary)} highlight />
            <Info label="Note" value={item.note || "-"} />
          </div>
        </div>

        <div className="checkout-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Close
          </button>

          <button
            type="button"
            className="login-btn"
            onClick={() => downloadPayrollPdf(item.id)}
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, highlight }) {
  return (
    <div>
      <span>{label}</span>
      <strong className={highlight ? "salary-highlight" : ""}>{value}</strong>
    </div>
  );
}