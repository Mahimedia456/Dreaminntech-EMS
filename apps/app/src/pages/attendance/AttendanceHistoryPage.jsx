import React, { useEffect, useState } from "react";
import { CalendarDays, Download, Filter, Search } from "lucide-react";

import {
  fetchAttendanceHistory,
  fetchAttendanceSummary,
} from "../../services/attendanceApi";

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatHours(minutes = 0) {
  const h = Math.floor(Number(minutes || 0) / 60);
  const m = Number(minutes || 0) % 60;
  return `${h}h ${m}m`;
}

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadHistory() {
    try {
      setLoading(true);

      const [historyRes, summaryRes] = await Promise.all([
        fetchAttendanceHistory(),
        fetchAttendanceSummary(),
      ]);

      setRecords(historyRes.records || []);
      setSummary(summaryRes.summary || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredRecords = records.filter((item) => {
    const keyword = search.toLowerCase();
    return (
      item.full_name?.toLowerCase().includes(keyword) ||
      item.email?.toLowerCase().includes(keyword) ||
      item.department?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Attendance History</h1>
          <p>Daily, weekly, monthly and yearly attendance records.</p>
        </div>
      </div>

      <div className="attendance-history-toolbar">
        <div className="salary-search">
          <Search size={18} />
          <input
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select>
          <option>Monthly</option>
          <option>Weekly</option>
          <option>Yearly</option>
        </select>

        <select>
          <option>All Departments</option>
        </select>

        <button className="filter-btn">
          <Filter size={16} />
          Filters
        </button>

        <button className="filter-btn">
          <Download size={16} />
          Export
        </button>
      </div>

      <div className="stats-grid">
        <HistoryStat title="Present" value={summary.present || 0} />
        <HistoryStat title="Late" value={summary.late || 0} />
        <HistoryStat title="Absent" value={summary.absent || 0} />
        <HistoryStat title="Leaves" value={summary.leaves || 0} />
      </div>

      <div className="dashboard-card">
        {loading ? (
          <p className="text-gray-400">Loading attendance history...</p>
        ) : (
          <div className="history-table">
            <div className="history-head">
              <span>Employee</span>
              <span>Date</span>
              <span>Check In</span>
              <span>Check Out</span>
              <span>Hours</span>
              <span>Status</span>
            </div>

            {filteredRecords.map((row) => (
              <div className="history-row" key={row.id}>
                <span>{row.full_name}</span>
                <span>{row.attendance_date}</span>
                <span>{formatTime(row.check_in)}</span>
                <span>{formatTime(row.check_out)}</span>
                <span>{formatHours(row.working_minutes)}</span>
                <span>{row.status}</span>
              </div>
            ))}

            {!filteredRecords.length && (
              <div className="history-row">
                <span>No records found</span>
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
    </div>
  );
}

function HistoryStat({ title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <CalendarDays size={22} />
      </div>

      <div>
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
}
