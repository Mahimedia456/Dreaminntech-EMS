import React from "react";
import {
  CalendarDays,
  CheckSquare,
  Clock3,
  FolderKanban,
  Users,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 10);
}

export default function ManagerDashboardPage({ data }) {
  const stats = data?.stats || {};
  const recent = data?.recent || {};

  const teamAttendanceRate =
    stats.team_members > 0
      ? Math.round((Number(stats.present_today || 0) / Number(stats.team_members)) * 100)
      : 0;

  const taskCompletion =
    stats.tasks > 0
      ? Math.round((Number(stats.completed_tasks || 0) / Number(stats.tasks)) * 100)
      : 0;

  return (
    <div>
      <div className="dashboard-hero">
        <div>
          <h1>Manager Dashboard</h1>
          <p>Team overview, approvals and project tracking.</p>
        </div>
      </div>

      <div className="stats-grid">
        <DashStat title="Team Members" value={stats.team_members || 0} icon={Users} />
        <DashStat title="Present Today" value={stats.present_today || 0} icon={Clock3} />
        <DashStat title="Late Today" value={stats.late_today || 0} icon={Clock3} />
        <DashStat title="Absent Today" value={stats.absent_today || 0} icon={CalendarDays} />
        <DashStat title="Pending Leaves" value={stats.pending_leaves || 0} icon={CalendarDays} />
        <DashStat title="Projects" value={stats.projects || 0} icon={FolderKanban} />
        <DashStat title="Tasks" value={stats.tasks || 0} icon={CheckSquare} />
        <DashStat title="Pending Tasks" value={stats.pending_tasks || 0} icon={CheckSquare} />
      </div>

      <div className="admin-dashboard-grid">
        <div className="dashboard-card">
          <h2>Team Health</h2>

          <div className="health-metrics">
            <div>
              <span>Attendance Rate</span>
              <strong>{teamAttendanceRate}%</strong>
            </div>

            <div>
              <span>Task Completion</span>
              <strong>{taskCompletion}%</strong>
            </div>

            <div>
              <span>Approved Leaves</span>
              <strong>{stats.approved_leaves || 0}</strong>
            </div>

            <div>
              <span>Completed Tasks</span>
              <strong>{stats.completed_tasks || 0}</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Pending Leave Requests</h2>

          <div className="dashboard-list">
            {(recent.leaves || []).map((item) => (
              <div key={item.id}>
                <strong>{item.employee_name}</strong>
                <span>
                  {item.leave_type} • {item.total_days} days • {item.status}
                </span>
              </div>
            ))}

            {!(recent.leaves || []).length && (
              <div>
                <strong>No pending leave requests</strong>
                <span>-</span>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Team Tasks</h2>

          <div className="dashboard-list">
            {(recent.tasks || []).map((task) => (
              <div key={task.id}>
                <strong>{task.title}</strong>
                <span>
                  {task.assigned_name || "Unassigned"} • {task.status} • Due{" "}
                  {formatDate(task.due_date)}
                </span>
              </div>
            ))}

            {!(recent.tasks || []).length && (
              <div>
                <strong>No team tasks found</strong>
                <span>-</span>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Manager Summary</h2>

          <div className="profile-info">
            <Info label="Team Members" value={stats.team_members || 0} />
            <Info label="Projects" value={stats.projects || 0} />
            <Info label="Pending Tasks" value={stats.pending_tasks || 0} />
            <Info label="Completed Tasks" value={stats.completed_tasks || 0} />
            <Info label="Late Today" value={stats.late_today || 0} />
            <Info label="Absent Today" value={stats.absent_today || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashStat({ title, value, icon: Icon }) {
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
