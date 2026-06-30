import React, { useEffect, useState } from "react";
import { Download, Eye, FileText, Printer, Search, Wallet } from "lucide-react";
import { downloadPayrollPdf, fetchPayroll } from "../../services/payrollApi";
import PayrollViewModal from "../../components/payroll/PayrollViewModal";

function money(value = 0) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

export default function SalarySlipsPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  async function loadSlips() {
    try {
      const data = await fetchPayroll();
      setItems(data.items || []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadSlips();
  }, []);

  const filtered = items.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.full_name?.toLowerCase().includes(keyword) ||
      item.department?.toLowerCase().includes(keyword) ||
      item.employee_code?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div>
      <div className="dashboard-header employees-header">
        <div>
          <h1>Salary Slips Center</h1>
          <p>View, download and print salary slips.</p>
        </div>
      </div>

      <div className="stats-grid">
        <SalaryStat title="Generated Slips" value={items.length} icon={FileText} />
        <SalaryStat
          title="Pending"
          value={items.filter((i) => i.status !== "paid").length}
          icon={Wallet}
        />
        <SalaryStat title="Downloads" value="PDF" icon={Download} />
        <SalaryStat title="Printed" value="Print" icon={Printer} />
      </div>

      <div className="dashboard-card">
        <div className="salary-toolbar">
          <div className="salary-search">
            <Search size={18} />
            <input
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select>
            <option>All Months</option>
          </select>
        </div>

        <div className="salary-table">
          <div className="salary-table-head">
            <span>Employee</span>
            <span>Department</span>
            <span>Month</span>
            <span>Net Salary</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filtered.map((item) => (
            <div className="salary-table-row" key={item.id}>
              <span>{item.full_name}</span>
              <span>{item.department || "-"}</span>
              <span>
                {item.payroll_month}/{item.payroll_year}
              </span>
              <span>{money(item.net_salary)}</span>
              <span>{item.status}</span>

              <div className="salary-actions">
                <button onClick={() => setSelected(item)}>
                  <Eye size={14} />
                  View
                </button>

                <button onClick={() => downloadPayrollPdf(item.id)}>
                  <Download size={14} />
                  PDF
                </button>
              </div>
            </div>
          ))}

          {!filtered.length && (
            <div className="salary-table-row">
              <span>No salary slips found</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
            </div>
          )}
        </div>
      </div>

      <PayrollViewModal
        open={Boolean(selected)}
        item={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
function SalaryStat({ title, value, icon: Icon }) {
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
