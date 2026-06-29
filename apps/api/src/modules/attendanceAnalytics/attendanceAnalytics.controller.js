import { query } from "../../config/db.js";

function getCurrentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const start = new Date(year, month, 1).toISOString().slice(0, 10);
  const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  return { start, end };
}

export async function getAttendanceAnalytics(req, res) {
  try {
    const { start, end } = getCurrentMonthRange();

    const stats = await query(
      `
      SELECT
        COUNT(*) FILTER (WHERE attendance_date = CURRENT_DATE AND status IN ('working','completed','late'))::int AS present_today,
        COUNT(*) FILTER (WHERE attendance_date = CURRENT_DATE AND late_minutes > 0)::int AS late_today,
        COUNT(*) FILTER (WHERE attendance_date = CURRENT_DATE AND status = 'absent')::int AS absent_today,
        COALESCE(SUM(overtime_minutes),0)::int AS overtime_minutes
      FROM attendance_records
      WHERE attendance_date BETWEEN $1 AND $2
      `,
      [start, end]
    );

    const rows = await query(
      `
      SELECT
        e.id AS employee_id,
        u.full_name,
        e.employee_code,
        d.name AS department,
        e.basic_salary,

        COUNT(ar.id) FILTER (WHERE ar.status IN ('working','completed','late'))::int AS present_days,
        COUNT(ar.id) FILTER (WHERE ar.late_minutes > 0)::int AS late_days,
        COUNT(ar.id) FILTER (WHERE ar.status = 'absent')::int AS absent_days,

        COALESCE(SUM(ar.overtime_minutes),0)::int AS overtime_minutes,
        COALESCE(SUM(ar.late_minutes),0)::int AS late_minutes,

        ROUND(
          COALESCE(SUM(ar.late_minutes),0) * 
          (
            CASE
              WHEN e.basic_salary > 0 THEN e.basic_salary / 30 / 8 / 60
              ELSE 0
            END
          ),
          2
        ) AS late_deduction,

        ROUND(
          e.basic_salary -
          (
            COALESCE(SUM(ar.late_minutes),0) *
            (
              CASE
                WHEN e.basic_salary > 0 THEN e.basic_salary / 30 / 8 / 60
                ELSE 0
              END
            )
          ),
          2
        ) AS salary_after_late

      FROM employees e
      JOIN app_users u ON u.id = e.user_id
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN attendance_records ar
        ON ar.employee_id = e.id
        AND ar.attendance_date BETWEEN $1 AND $2

      WHERE e.deleted_at IS NULL

      GROUP BY e.id, u.full_name, e.employee_code, d.name, e.basic_salary
      ORDER BY u.full_name ASC
      `,
      [start, end]
    );

    return res.json({
      stats: stats.rows[0],
      rows: rows.rows,
      range: { start, end },
    });
  } catch (error) {
    console.error("Attendance analytics error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}