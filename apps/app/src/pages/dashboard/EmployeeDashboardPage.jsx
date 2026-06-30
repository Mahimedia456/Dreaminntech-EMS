import React from "react";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  Clock3,
  FolderKanban,
  Wallet,
} from "lucide-react";

function money(value = 0) {
  return `Rs ${Number(value || 0).toLocaleString()}`;
}

function minutesToHours(minutes = 0) {
  const total = Number(minutes || 0);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${m}m`;
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 10);
}

export default function EmployeeDashboardPage({ data }) {
  const stats = data?.stats || {};
  const recent = data?.recent || {};

  return (
    <div>
      <div className="dashboard-hero">
        <div>
          <h1>My Dashboard</h1>
          <p>Track attendance, tasks, leaves and salary information.</p>
        </div>
      </div>

      <div className="stats-grid">
        <EmpStat
          title="Working Hours"
          value={minutesToHours(stats.working_hours)}
          icon={Clock3}
        />

        <EmpStat
          title="Attendance Status"
          value={stats.attendance_status || "not_checked_in"}
          icon={Clock3}
        />

        <EmpStat
          title="Late Minutes"
          value={stats.late_minutes || 0}
          icon={CalendarDays}
        />

        <EmpStat
          title="Leaves Left"
          value={stats.leaves_left || 0}
          icon={CalendarDays}
        />

        <EmpStat
          title="Tasks"
          value={stats.tasks || 0}
          icon={CheckSquare}
        />

        <EmpStat
          title="Pending Tasks"
          value={stats.pending_tasks || 0}
          icon={CheckSquare}
        />

        <EmpStat
          title="Projects"
          value={stats.projects || 0}
          icon={FolderKanban}
        />

        <EmpStat
          title="Latest Salary"
          value={money(stats.latest_salary)}
          icon={Wallet}
        />
      </div>

      <div className="admin-dashboard-grid">
        <div className="dashboard-card">
          <h2>Today's Attendance</h2>

          <div className="profile-info">
            <Info label="Status" value={stats.attendance_status || "Not Checked In"} />
            <Info label="Check In" value={stats.check_in || "-"} />
            <Info label="Check Out" value={stats.check_out || "-"} />
            <Info label="Working Hours" value={minutesToHours(stats.working_hours)} />
            <Info label="Late Minutes" value={stats.late_minutes || 0} />
          </div>
        </div>

        <div className="dashboard-card">
          <h2>My Tasks</h2>

          <div className="dashboard-list">
            {(recent.tasks || []).map((task) => (
              <div key={task.id}>
                <strong>{task.title}</strong>
                <span>
                  {task.project_title || "No Project"} • {task.status} • Due{" "}
                  {formatDate(task.due_date)}
                </span>
              </div>
            ))}

            {!(recent.tasks || []).length && (
              <div>
                <strong>No assigned tasks</strong>
                <span>-</span>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Upcoming Holidays</h2>

          <div className="dashboard-list">
            {(recent.holidays || []).map((holiday) => (
              <div key={holiday.title}>
                <strong>{holiday.title}</strong>
                <span>{formatDate(holiday.holiday_date)}</span>
              </div>
            ))}

            {!(recent.holidays || []).length && (
              <div>
                <strong>No upcoming holidays</strong>
                <span>-</span>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>My Summary</h2>

          <div className="health-metrics">
            <div>
              <span>Total Tasks</span>
              <strong>{stats.tasks || 0}</strong>
            </div>

            <div>
              <span>Completed Tasks</span>
              <strong>{stats.completed_tasks || 0}</strong>
            </div>

            <div>
              <span>Pending Tasks</span>
              <strong>{stats.pending_tasks || 0}</strong>
            </div>

            <div>
              <span>Projects</span>
              <strong>{stats.projects || 0}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h2>Notifications</h2>

        <div className="dashboard-list">
          <div>
            <strong>
              <Bell size={15} /> Salary & attendance updates
            </strong>
            <span>Your dashboard is synced with live system data.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmpStat({ title, value, icon: Icon }) {
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
