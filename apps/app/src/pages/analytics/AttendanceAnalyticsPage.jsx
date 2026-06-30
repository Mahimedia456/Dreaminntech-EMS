import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Download,
  Users,
} from "lucide-react";
import { fetchAttendanceAnalytics } from "../../services/attendanceAnalyticsApi";

function formatMinutes(minutes = 0) {
  const total = Number(minutes || 0);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${m}m`;
}

function money(value = 0) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

export default function AttendanceAnalyticsPage() {
  const [stats, setStats] = useState({});
  const [rows, setRows] = useState([]);
  const [range, setRange] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchAttendanceAnalytics();

      setStats(data.stats || {});
      setRows(data.rows || []);
      setRange(data.range || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div>
      <div className="dashboard-header employees-header">
        <div>
          <h1>Attendance Analytics</h1>
          <p>
            Track late minutes, absents, overtime and monthly attendance.
          </p>
          {range.start && (
            <p>
              Current Range: {range.start} to {range.end}
            </p>
          )}
        </div>

        <button className="employee-add-btn" type="button">
          <Download size={18} />
          Export
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="stats-grid">
        <AnalyticsStat
          title="Present Today"
          value={stats.present_today || 0}
          icon={Users}
        />

        <AnalyticsStat
          title="Late Today"
          value={stats.late_today || 0}
          icon={AlertTriangle}
        />

        <AnalyticsStat
          title="Absent Today"
          value={stats.absent_today || 0}
          icon={CalendarDays}
        />

        <AnalyticsStat
          title="Overtime Hours"
          value={formatMinutes(stats.overtime_minutes || 0)}
          icon={Clock3}
        />
      </div>

      <div className="dashboard-card">
        <h2>Monthly Attendance Calculation</h2>

        {loading ? (
          <p className="text-gray-400">Loading analytics...</p>
        ) : (
          <div className="analytics-table">
            <div className="analytics-table-head">
              <span>Employee</span>
              <span>Present</span>
              <span>Late</span>
              <span>Absent</span>
              <span>Overtime</span>
              <span>Deduction</span>
              <span>Salary Impact</span>
            </div>

            {rows.map((row) => (
              <div className="analytics-table-row" key={row.employee_id}>
                <span>
                  <strong>{row.full_name}</strong>
                  <small>{row.department || "-"}</small>
                </span>

                <span>{row.present_days || 0}</span>
                <span>{row.late_days || 0}</span>
                <span>{row.absent_days || 0}</span>
                <span>{formatMinutes(row.overtime_minutes || 0)}</span>
                <span>{money(row.late_deduction || 0)}</span>
                <span>{money(row.salary_after_late || row.basic_salary || 0)}</span>
              </div>
            ))}

            {!rows.length && (
              <div className="analytics-table-row">
                <span>No analytics found</span>
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

      <div className="payroll-grid">
        <div className="dashboard-card">
          <h2>Late Deduction Rules</h2>

          <div className="profile-info">
            <div>
              <span>Grace Time</span>
              <strong>Based on assigned shift</strong>
            </div>

            <div>
              <span>Late Deduction</span>
              <strong>Per Minute</strong>
            </div>

            <div>
              <span>Half Day</span>
              <strong>After 60 Minutes Late</strong>
            </div>

            <div>
              <span>Absent</span>
              <strong>No Check In</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Salary Calculation Logic</h2>

          <div className="formula-box">
            Monthly Salary
            <br />
            - Late Deduction
            <br />
            - Extra Leave Deduction
            <br />
            - Absent Deduction
            <br />
            + Overtime Amount
            <br />
            = Net Payable Salary
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsStat({ title, value, icon: Icon }) {
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
