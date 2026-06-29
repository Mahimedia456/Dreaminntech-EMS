import { query } from "../../config/db.js";

async function getEmployeeByUser(userId) {
  const result = await query(
    `
    SELECT e.*, u.full_name, u.email, u.role
    FROM employees e
    JOIN app_users u ON u.id = e.user_id
    WHERE e.user_id=$1
    AND e.deleted_at IS NULL
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

function money(value = 0) {
  return Number(value || 0);
}

export async function getDashboard(req, res) {
  try {
    if (req.user.role === "admin") return getAdminDashboard(req, res);
    if (req.user.role === "manager") return getManagerDashboard(req, res);
    return getEmployeeDashboard(req, res);
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

async function getAdminDashboard(req, res) {
  const [
    employees,
    attendance,
    projects,
    tasks,
    payroll,
    leaves,
    recentTasks,
    recentLeaves,
    recentAttendance,
  ] = await Promise.all([
    query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE e.status='active')::int AS active,
        COUNT(*) FILTER (WHERE e.status!='active')::int AS inactive
      FROM employees e
      WHERE e.deleted_at IS NULL
    `),

    query(`
      SELECT
        COUNT(*) FILTER (WHERE ar.status IN ('working','completed','late'))::int AS present_today,
        COUNT(*) FILTER (WHERE COALESCE(ar.late_minutes,0) > 0)::int AS late_today,
        COUNT(*) FILTER (WHERE ar.status='absent')::int AS absent_today,
        COALESCE(SUM(ar.overtime_minutes),0)::int AS overtime_minutes
      FROM attendance_records ar
      WHERE ar.attendance_date = CURRENT_DATE
    `),

    query(`
      SELECT
        COUNT(*)::int AS total_projects,
        COUNT(*) FILTER (WHERE p.status='active')::int AS active_projects,
        COUNT(*) FILTER (WHERE p.status='completed')::int AS completed_projects
      FROM projects p
    `),

    query(`
      SELECT
        COUNT(*)::int AS total_tasks,
        COUNT(*) FILTER (WHERE t.status!='completed')::int AS pending_tasks,
        COUNT(*) FILTER (WHERE t.status='completed')::int AS completed_tasks,
        COUNT(*) FILTER (WHERE t.priority='urgent')::int AS urgent_tasks
      FROM tasks t
    `),

    query(`
      SELECT
        COALESCE(SUM(pi.net_salary),0) AS monthly_payroll,
        COALESCE(SUM(pi.total_deductions),0) AS deductions
      FROM payroll_items AS pi
      INNER JOIN payroll_runs AS pr
        ON pr.id = pi.payroll_run_id
      WHERE pr.payroll_month = EXTRACT(MONTH FROM CURRENT_DATE)::int
      AND pr.payroll_year = EXTRACT(YEAR FROM CURRENT_DATE)::int
    `),

    query(`
      SELECT
        COUNT(*) FILTER (WHERE lr.status='pending')::int AS pending_leaves,
        COUNT(*) FILTER (WHERE lr.status='approved')::int AS approved_leaves,
        COUNT(*) FILTER (
          WHERE lr.status='approved'
          AND CURRENT_DATE BETWEEN lr.start_date AND lr.end_date
        )::int AS on_leave_today
      FROM leave_requests lr
    `),

    query(`
      SELECT
        t.id,
        t.title,
        t.status,
        t.priority,
        u.full_name AS assigned_name,
        t.created_at
      FROM tasks t
      LEFT JOIN employees e ON e.id = t.assigned_to
      LEFT JOIN app_users u ON u.id = e.user_id
      ORDER BY t.created_at DESC
      LIMIT 5
    `),

    query(`
      SELECT
        lr.id,
        lr.status,
        lr.total_days,
        lt.name AS leave_type,
        u.full_name AS employee_name,
        lr.created_at
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      JOIN app_users u ON u.id = e.user_id
      JOIN leave_types lt ON lt.id = lr.leave_type_id
      ORDER BY lr.created_at DESC
      LIMIT 5
    `),

    query(`
      SELECT
        ar.id,
        ar.attendance_date,
        ar.check_in,
        ar.status,
        ar.late_minutes,
        u.full_name
      FROM attendance_records ar
      JOIN employees e ON e.id = ar.employee_id
      JOIN app_users u ON u.id = e.user_id
      WHERE ar.attendance_date = CURRENT_DATE
      ORDER BY ar.check_in DESC NULLS LAST
      LIMIT 5
    `),
  ]);

  const e = employees.rows[0] || {};
  const a = attendance.rows[0] || {};
  const p = projects.rows[0] || {};
  const t = tasks.rows[0] || {};
  const pay = payroll.rows[0] || {};
  const l = leaves.rows[0] || {};

  return res.json({
    role: "admin",
    stats: {
      employees: e.total || 0,
      active_employees: e.active || 0,
      inactive_employees: e.inactive || 0,
      present_today: a.present_today || 0,
      late_today: a.late_today || 0,
      absent_today: a.absent_today || 0,
      overtime_minutes: a.overtime_minutes || 0,
      on_leave_today: l.on_leave_today || 0,
      monthly_payroll: money(pay.monthly_payroll),
      payroll_deductions: money(pay.deductions),
      projects: p.total_projects || 0,
      active_projects: p.active_projects || 0,
      completed_projects: p.completed_projects || 0,
      tasks: t.total_tasks || 0,
      pending_tasks: t.pending_tasks || 0,
      completed_tasks: t.completed_tasks || 0,
      urgent_tasks: t.urgent_tasks || 0,
      pending_leaves: l.pending_leaves || 0,
      approved_leaves: l.approved_leaves || 0,
    },
    recent: {
      tasks: recentTasks.rows,
      leaves: recentLeaves.rows,
      attendance: recentAttendance.rows,
    },
  });
}

async function getManagerDashboard(req, res) {
  const employee = await getEmployeeByUser(req.user.id);

  if (!employee) {
    return res.json({ role: "manager", stats: {}, recent: {} });
  }

  const [team, attendance, projects, tasks, leaves, recentTasks, recentLeaves] =
    await Promise.all([
      query(
        `
        SELECT COUNT(*)::int AS team_members
        FROM project_members
        WHERE employee_id=$1
        `,
        [employee.id]
      ).catch(() => ({ rows: [{ team_members: 0 }] })),

      query(
        `
        SELECT
          COUNT(*) FILTER (WHERE ar.status IN ('working','completed','late'))::int AS present_today,
          COUNT(*) FILTER (WHERE COALESCE(ar.late_minutes,0) > 0)::int AS late_today,
          COUNT(*) FILTER (WHERE ar.status='absent')::int AS absent_today
        FROM attendance_records ar
        JOIN employees e ON e.id = ar.employee_id
        WHERE ar.attendance_date = CURRENT_DATE
        AND (
          e.id = $1
          OR EXISTS (
            SELECT 1 FROM project_members pm
            JOIN projects p ON p.id = pm.project_id
            WHERE pm.employee_id = e.id
            AND p.manager_id = $1
          )
        )
        `,
        [employee.id]
      ),

      query(
        `
        SELECT COUNT(DISTINCT p.id)::int AS projects
        FROM projects p
        LEFT JOIN project_members pm ON pm.project_id=p.id
        WHERE p.manager_id=$1 OR pm.employee_id=$1
        `,
        [employee.id]
      ),

      query(
        `
        SELECT
          COUNT(*)::int AS tasks,
          COUNT(*) FILTER (WHERE t.status!='completed')::int AS pending_tasks,
          COUNT(*) FILTER (WHERE t.status='completed')::int AS completed_tasks
        FROM tasks t
        WHERE t.assigned_to=$1
        OR EXISTS (
          SELECT 1 FROM projects p
          WHERE p.id=t.project_id
          AND p.manager_id=$1
        )
        `,
        [employee.id]
      ),

      query(
        `
        SELECT
          COUNT(*) FILTER (WHERE lr.status='pending')::int AS pending_leaves,
          COUNT(*) FILTER (WHERE lr.status='approved')::int AS approved_leaves
        FROM leave_requests lr
        JOIN employees e ON e.id=lr.employee_id
        WHERE e.id=$1
        OR EXISTS (
          SELECT 1 FROM project_members pm
          JOIN projects p ON p.id=pm.project_id
          WHERE pm.employee_id=e.id
          AND p.manager_id=$1
        )
        `,
        [employee.id]
      ),

      query(
        `
        SELECT
          t.id,
          t.title,
          t.status,
          t.priority,
          u.full_name AS assigned_name,
          t.due_date
        FROM tasks t
        LEFT JOIN employees e ON e.id=t.assigned_to
        LEFT JOIN app_users u ON u.id=e.user_id
        WHERE t.assigned_to=$1
        OR EXISTS (
          SELECT 1 FROM projects p
          WHERE p.id=t.project_id
          AND p.manager_id=$1
        )
        ORDER BY t.created_at DESC
        LIMIT 5
        `,
        [employee.id]
      ),

      query(
        `
        SELECT
          lr.id,
          lr.status,
          lr.total_days,
          lt.name AS leave_type,
          u.full_name AS employee_name
        FROM leave_requests lr
        JOIN employees e ON e.id=lr.employee_id
        JOIN app_users u ON u.id=e.user_id
        JOIN leave_types lt ON lt.id=lr.leave_type_id
        WHERE lr.status='pending'
        ORDER BY lr.created_at DESC
        LIMIT 5
        `
      ),
    ]);

  return res.json({
    role: "manager",
    stats: {
      team_members: team.rows[0]?.team_members || 0,
      present_today: attendance.rows[0]?.present_today || 0,
      late_today: attendance.rows[0]?.late_today || 0,
      absent_today: attendance.rows[0]?.absent_today || 0,
      projects: projects.rows[0]?.projects || 0,
      tasks: tasks.rows[0]?.tasks || 0,
      pending_tasks: tasks.rows[0]?.pending_tasks || 0,
      completed_tasks: tasks.rows[0]?.completed_tasks || 0,
      pending_leaves: leaves.rows[0]?.pending_leaves || 0,
      approved_leaves: leaves.rows[0]?.approved_leaves || 0,
    },
    recent: {
      tasks: recentTasks.rows,
      leaves: recentLeaves.rows,
    },
  });
}

async function getEmployeeDashboard(req, res) {
  const employee = await getEmployeeByUser(req.user.id);

  if (!employee) {
    return res.json({ role: "employee", stats: {}, recent: {} });
  }

  const [todayAttendance, leaves, tasks, projects, salary, recentTasks, holidays] =
    await Promise.all([
      query(
        `
        SELECT *
        FROM attendance_records
        WHERE employee_id=$1
        AND attendance_date=CURRENT_DATE
        LIMIT 1
        `,
        [employee.id]
      ),

      query(
        `
        SELECT COALESCE(SUM(remaining_days),0)::int AS leaves_left
        FROM leave_balances
        WHERE employee_id=$1
        `,
        [employee.id]
      ).catch(() => ({ rows: [{ leaves_left: 0 }] })),

      query(
        `
        SELECT
          COUNT(*)::int AS tasks,
          COUNT(*) FILTER (WHERE status!='completed')::int AS pending_tasks,
          COUNT(*) FILTER (WHERE status='completed')::int AS completed_tasks
        FROM tasks
        WHERE assigned_to=$1
        `,
        [employee.id]
      ),

      query(
        `
        SELECT COUNT(DISTINCT p.id)::int AS projects
        FROM projects p
        LEFT JOIN project_members pm ON pm.project_id=p.id
        WHERE p.manager_id=$1 OR pm.employee_id=$1
        `,
        [employee.id]
      ),

      query(
        `
        SELECT pi.net_salary
        FROM payroll_items pi
        JOIN payroll_runs pr ON pr.id=pi.payroll_run_id
        WHERE pi.employee_id=$1
        ORDER BY pr.payroll_year DESC, pr.payroll_month DESC
        LIMIT 1
        `,
        [employee.id]
      ),

      query(
        `
        SELECT
          t.id,
          t.title,
          t.status,
          t.priority,
          t.due_date,
          p.title AS project_title
        FROM tasks t
        LEFT JOIN projects p ON p.id=t.project_id
        WHERE t.assigned_to=$1
        ORDER BY t.due_date ASC NULLS LAST
        LIMIT 5
        `,
        [employee.id]
      ),

      query(`
        SELECT title, holiday_date
        FROM holidays
        WHERE holiday_date >= CURRENT_DATE
        ORDER BY holiday_date ASC
        LIMIT 5
      `),
    ]);

  const att = todayAttendance.rows[0] || null;

  return res.json({
    role: "employee",
    stats: {
      working_hours: att?.working_minutes || 0,
      attendance_status: att?.status || "not_checked_in",
      check_in: att?.check_in || null,
      check_out: att?.check_out || null,
      late_minutes: att?.late_minutes || 0,
      leaves_left: leaves.rows[0]?.leaves_left || 0,
      tasks: tasks.rows[0]?.tasks || 0,
      pending_tasks: tasks.rows[0]?.pending_tasks || 0,
      completed_tasks: tasks.rows[0]?.completed_tasks || 0,
      projects: projects.rows[0]?.projects || 0,
      latest_salary: money(salary.rows[0]?.net_salary || 0),
    },
    recent: {
      tasks: recentTasks.rows,
      holidays: holidays.rows,
    },
  });
}