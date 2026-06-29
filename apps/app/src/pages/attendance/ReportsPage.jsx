import { useEffect, useState } from "react";
import { CalendarDays, Download, FileText, Search } from "lucide-react";
import { fetchAttendanceHistory } from "../../services/attendanceApi";

function formatHours(minutes = 0) {
  const h = Math.floor(Number(minutes || 0) / 60);
  const m = Number(minutes || 0) % 60;
  return `${h}h ${m}m`;
}

export default function ReportsPage() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");

  async function loadReports() {
    try {
      const data = await fetchAttendanceHistory();
      setRecords(data.records || []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const filtered = records.filter((item) => {
    const keyword = search.toLowerCase();
    return (
      item.full_name?.toLowerCase().includes(keyword) ||
      item.department?.toLowerCase().includes(keyword) ||
      item.status?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div>
      <div className="dashboard-header employees-header">
        <div>
          <h1>Attendance Reports</h1>
          <p>Monthly, yearly and filtered attendance reports.</p>
        </div>

        <button className="employee-add-btn">
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="stats-grid">
        <ReportStat title="Total Records" value={records.length} icon={FileText} />
        <ReportStat
          title="Present"
          value={records.filter((item) => item.status === "completed").length}
          icon={CalendarDays}
        />
        <ReportStat
          title="Late"
          value={records.filter((item) => Number(item.late_minutes || 0) > 0).length}
          icon={CalendarDays}
        />
        <ReportStat
          title="Total Hours"
          value={formatHours(records.reduce((sum, item) => sum + Number(item.working_minutes || 0), 0))}
          icon={CalendarDays}
        />
      </div>

      <div className="dashboard-card">
        <div className="attendance-history-toolbar">
          <div className="salary-search">
            <Search size={18} />
            <input
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select>
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
          </select>
        </div>

        <div className="history-table">
          <div className="history-head">
            <span>Employee</span>
            <span>Date</span>
            <span>Department</span>
            <span>Hours</span>
            <span>Late</span>
            <span>Status</span>
          </div>

          {filtered.map((row) => (
            <div className="history-row" key={row.id}>
              <span>{row.full_name}</span>
              <span>{row.attendance_date}</span>
              <span>{row.department || "-"}</span>
              <span>{formatHours(row.working_minutes)}</span>
              <span>{row.late_minutes || 0}m</span>
              <span>{row.status}</span>
            </div>
          ))}

          {!filtered.length && (
            <div className="history-row">
              <span>No reports found</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportStat({ title, value, icon: Icon }) {
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