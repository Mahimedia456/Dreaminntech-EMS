import {
  Bell,
  CalendarDays,
  CheckSquare,
  FolderKanban,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
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

function getMonthLabel() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function AdminDashboardPage({ data }) {
  const stats = data?.stats || {};
  const recent = data?.recent || {};

  const attendanceRate =
    stats.employees > 0
      ? Math.round((Number(stats.present_today || 0) / Number(stats.employees)) * 100)
      : 0;

  const taskCompletion =
    stats.tasks > 0
      ? Math.round((Number(stats.completed_tasks || 0) / Number(stats.tasks)) * 100)
      : 0;

  const projectDelivery =
    stats.projects > 0
      ? Math.round((Number(stats.completed_projects || 0) / Number(stats.projects)) * 100)
      : 0;

  return (
    <div>
      <div className="dashboard-hero">
        <div>
          <h1>Welcome Back, Admin</h1>
          <p>Complete company overview and workforce analytics.</p>
        </div>

        <div className="dashboard-date">{getMonthLabel()}</div>
      </div>

      <div className="stats-grid">
        <DashStat title="Employees" value={stats.employees || 0} icon={Users} />
        <DashStat title="Present Today" value={stats.present_today || 0} icon={UserCheck} />
        <DashStat title="Late Today" value={stats.late_today || 0} icon={CalendarDays} />
        <DashStat title="Absent" value={stats.absent_today || 0} icon={UserX} />
        <DashStat title="On Leave" value={stats.on_leave_today || 0} icon={CalendarDays} />
        <DashStat title="Payroll" value={money(stats.monthly_payroll)} icon={Wallet} />
        <DashStat title="Projects" value={stats.projects || 0} icon={FolderKanban} />
        <DashStat title="Tasks" value={stats.tasks || 0} icon={CheckSquare} />
        <DashStat title="Urgent Tasks" value={stats.urgent_tasks || 0} icon={Bell} />
        <DashStat title="Overtime" value={minutesToHours(stats.overtime_minutes)} icon={TrendingUp} />
      </div>

      <div className="admin-dashboard-grid">
        <div className="dashboard-card">
          <h2>Recent Attendance</h2>

          <div className="dashboard-list">
            {(recent.attendance || []).map((item) => (
              <div key={item.id}>
                <strong>{item.full_name}</strong>
                <span>
                  {item.status} • {item.check_in || "-"} • Late{" "}
                  {item.late_minutes || 0} min
                </span>
              </div>
            ))}

            {!(recent.attendance || []).length && (
              <div>
                <strong>No attendance records today</strong>
                <span>-</span>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Company Health</h2>

          <div className="health-metrics">
            <div>
              <span>Attendance Rate</span>
              <strong>{attendanceRate}%</strong>
            </div>

            <div>
              <span>Task Completion</span>
              <strong>{taskCompletion}%</strong>
            </div>

            <div>
              <span>Project Delivery</span>
              <strong>{projectDelivery}%</strong>
            </div>

            <div>
              <span>Pending Leaves</span>
              <strong>{stats.pending_leaves || 0}</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Recent Leave Requests</h2>

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
                <strong>No leave requests</strong>
                <span>-</span>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Recent Tasks</h2>

          <div className="dashboard-list">
            {(recent.tasks || []).map((item) => (
              <div key={item.id}>
                <strong>{item.title}</strong>
                <span>
                  {item.assigned_name || "Unassigned"} • {item.status} •{" "}
                  {item.priority}
                </span>
              </div>
            ))}

            {!(recent.tasks || []).length && (
              <div>
                <strong>No recent tasks</strong>
                <span>-</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h2>Executive Summary</h2>

        <div className="salary-preview">
          <Summary label="Active Employees" value={stats.active_employees || 0} />
          <Summary label="Inactive Employees" value={stats.inactive_employees || 0} />
          <Summary label="Payroll Deductions" value={money(stats.payroll_deductions)} />
          <Summary label="Active Projects" value={stats.active_projects || 0} />
          <Summary label="Completed Projects" value={stats.completed_projects || 0} />
          <Summary label="Pending Tasks" value={stats.pending_tasks || 0} />
          <Summary label="Completed Tasks" value={stats.completed_tasks || 0} />
          <Summary label="Approved Leaves" value={stats.approved_leaves || 0} />
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

function Summary({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}