import React from "react";
import {
  Download,
  FileBarChart,
  FileSpreadsheet,
  Users,
  Wallet,
} from "lucide-react";

export default function ReportsCenterPage() {
  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Reports Center</h1>
          <p>
            Attendance, payroll, employee and project reports.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <ReportStat title="Attendance Reports" value="42" icon={FileBarChart} />
        <ReportStat title="Payroll Reports" value="24" icon={Wallet} />
        <ReportStat title="Employee Reports" value="18" icon={Users} />
        <ReportStat title="Exports" value="108" icon={Download} />
      </div>

      <div className="report-grid">
        <ReportCard
          title="Attendance Report"
          desc="Monthly attendance, late and absent reports."
        />

        <ReportCard
          title="Leave Report"
          desc="Employee leave balances and approvals."
        />

        <ReportCard
          title="Payroll Report"
          desc="Salary calculations and deductions."
        />

        <ReportCard
          title="Employee Report"
          desc="Department and employee statistics."
        />

        <ReportCard
          title="Project Report"
          desc="Project performance and completion."
        />

        <ReportCard
          title="Task Report"
          desc="Task productivity and timelines."
        />
      </div>
    </div>
  );
}

function ReportCard({
  title,
  desc,
}) {
  return (
    <div className="report-card">
      <div className="stat-icon">
        <FileSpreadsheet size={22} />
      </div>

      <h3>{title}</h3>
      <p>{desc}</p>

      <div className="report-actions">
        <button>View</button>
        <button>Export</button>
      </div>
    </div>
  );
}

function ReportStat({
  title,
  value,
  icon: Icon,
}) {
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
