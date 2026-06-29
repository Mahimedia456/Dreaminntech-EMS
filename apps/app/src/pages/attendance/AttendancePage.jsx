import { useEffect, useState } from "react";
import {
  AlarmClock,
  ClipboardCheck,
  Coffee,
  LogIn,
  LogOut,
  Timer,
} from "lucide-react";

import {
  breakIn,
  breakOut,
  checkIn,
  checkOut,
  fetchTodayAttendance,
  lunchIn,
  lunchOut,
} from "../../services/attendanceApi";

import CheckoutReportModal from "../../components/attendance/CheckoutReportModal";

function formatTime(value) {
  if (!value) return "--";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMinutes(minutes = 0) {
  const h = Math.floor(Number(minutes || 0) / 60);
  const m = Number(minutes || 0) % 60;
  return `${h}h ${m}m`;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  async function loadAttendance() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchTodayAttendance();

      setAttendance(data.attendance);
      setEmployee(data.employee);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function runAction(name, fn, openReport = false) {
    try {
      setActionLoading(name);
      setError("");

      await fn();
      await loadAttendance();

      if (openReport) {
        setShowReportModal(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading("");
    }
  }

  useEffect(() => {
    loadAttendance();
  }, []);

  if (loading) {
    return <div className="dashboard-card">Loading attendance...</div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Attendance Portal</h1>
          <p>Track working hours, breaks, lunch and daily reports.</p>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="attendance-top-grid">
        <div className="attendance-live-card">
          <h2>Today&apos;s Working Time</h2>

          <div className="attendance-timer">
            {formatMinutes(attendance?.working_minutes || 0)}
          </div>

          <div className="attendance-meta">
            <div>
              <span>Employee</span>
              <strong>{employee?.full_name || "-"}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{attendance?.status || "not_started"}</strong>
            </div>
          </div>

          <div className="attendance-meta" style={{ marginTop: 12 }}>
            <div>
              <span>Check In</span>
              <strong>{formatTime(attendance?.check_in)}</strong>
            </div>

            <div>
              <span>Check Out</span>
              <strong>{formatTime(attendance?.check_out)}</strong>
            </div>
          </div>
        </div>

        <div className="attendance-actions">
          <button
            className="attendance-btn"
            disabled={actionLoading || attendance?.check_in}
            onClick={() => runAction("check-in", checkIn)}
          >
            <LogIn size={18} />
            {actionLoading === "check-in" ? "Saving..." : "Check In"}
          </button>

          <button
            className="attendance-btn"
            disabled={actionLoading || !attendance?.check_in || attendance?.lunch_out}
            onClick={() => runAction("lunch-out", lunchOut)}
          >
            <Coffee size={18} />
            {actionLoading === "lunch-out" ? "Saving..." : "Lunch Out"}
          </button>

          <button
            className="attendance-btn"
            disabled={actionLoading || !attendance?.lunch_out || attendance?.lunch_in}
            onClick={() => runAction("lunch-in", lunchIn)}
          >
            <Coffee size={18} />
            {actionLoading === "lunch-in" ? "Saving..." : "Lunch In"}
          </button>

          <button
            className="attendance-btn"
            disabled={actionLoading || !attendance?.check_in || attendance?.break_out}
            onClick={() => runAction("break-out", breakOut)}
          >
            <Timer size={18} />
            {actionLoading === "break-out" ? "Saving..." : "Break Out"}
          </button>

          <button
            className="attendance-btn"
            disabled={actionLoading || !attendance?.break_out || attendance?.break_in}
            onClick={() => runAction("break-in", breakIn)}
          >
            <Timer size={18} />
            {actionLoading === "break-in" ? "Saving..." : "Break In"}
          </button>

          <button
            className="attendance-btn checkout"
            disabled={actionLoading || !attendance?.check_in || attendance?.check_out}
            onClick={() => runAction("check-out", checkOut, true)}
          >
            <LogOut size={18} />
            {actionLoading === "check-out" ? "Saving..." : "Check Out"}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <AttendanceStat
          title="Working Hours"
          value={formatMinutes(attendance?.working_minutes || 0)}
          icon={AlarmClock}
        />

        <AttendanceStat
          title="Break Time"
          value={`${attendance?.break_minutes || 0}m`}
          icon={Timer}
        />

        <AttendanceStat
          title="Lunch Time"
          value={`${attendance?.lunch_minutes || 0}m`}
          icon={Coffee}
        />

        <AttendanceStat
          title="Overtime"
          value={`${attendance?.overtime_minutes || 0}m`}
          icon={ClipboardCheck}
        />
      </div>

      <div className="dashboard-card">
        <h2>Today&apos;s Timeline</h2>

        <div className="attendance-timeline">
          <TimelineItem time={formatTime(attendance?.check_in)} title="Checked In" />
          <TimelineItem time={formatTime(attendance?.lunch_out)} title="Lunch Out" />
          <TimelineItem time={formatTime(attendance?.lunch_in)} title="Lunch In" />
          <TimelineItem time={formatTime(attendance?.break_out)} title="Break Out" />
          <TimelineItem time={formatTime(attendance?.break_in)} title="Break In" />
          <TimelineItem time={formatTime(attendance?.check_out)} title="Checked Out" />
        </div>
      </div>

      <div className="dashboard-card">
        <h2>Today&apos;s Tasks</h2>

        <div className="dashboard-list">
          <div>
            <strong>Daily work report</strong>
            <span>{attendance?.check_out ? "Required after checkout" : "Pending checkout"}</span>
          </div>
        </div>
      </div>

      <CheckoutReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmitted={() => {
          setShowReportModal(false);
          loadAttendance();
        }}
      />
    </div>
  );
}

function TimelineItem({ time, title }) {
  return (
    <div className="timeline-item">
      <div className="timeline-dot" />

      <div>
        <strong>{title}</strong>
        <p>{time}</p>
      </div>
    </div>
  );
}

function AttendanceStat({ title, value, icon: Icon }) {
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