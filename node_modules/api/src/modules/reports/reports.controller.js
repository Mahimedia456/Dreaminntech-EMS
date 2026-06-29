import { query } from "../../config/db.js";

async function getEmployeeByUser(userId) {
  const result = await query(
    `
    SELECT e.*, u.role
    FROM employees e
    JOIN app_users u ON u.id = e.user_id
    WHERE e.user_id=$1
    AND e.deleted_at IS NULL
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0];
}

export async function getReportsSummary(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    const employeeWhere =
      req.user.role === "employee" || req.user.role === "manager"
        ? `WHERE e.user_id = $1`
        : "";

    const params =
      req.user.role === "employee" || req.user.role === "manager"
        ? [req.user.id]
        : [];

    const employees = await query(
      `
      SELECT COUNT(*)::int AS count
      FROM employees e
      ${employeeWhere}
      `,
      params
    );

    const attendance = await query(
      `
      SELECT COUNT(*)::int AS count
      FROM attendance_records ar
      JOIN employees e ON e.id = ar.employee_id
      ${
        req.user.role === "admin"
          ? ""
          : "WHERE e.user_id = $1"
      }
      `,
      params
    );

    const payroll = await query(
      `
      SELECT COUNT(*)::int AS count
      FROM payroll_items pi
      JOIN employees e ON e.id = pi.employee_id
      ${
        req.user.role === "admin"
          ? ""
          : "WHERE e.user_id = $1"
      }
      `,
      params
    );

    const projects = await query(
      `
      SELECT COUNT(DISTINCT p.id)::int AS count
      FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id
      ${
        req.user.role === "admin"
          ? ""
          : "WHERE pm.employee_id = $1 OR p.manager_id = $1"
      }
      `,
      req.user.role === "admin" ? [] : [employee?.id]
    );

    const tasks = await query(
      `
      SELECT COUNT(*)::int AS count
      FROM tasks t
      ${
        req.user.role === "admin"
          ? ""
          : "WHERE t.assigned_to = $1"
      }
      `,
      req.user.role === "admin" ? [] : [employee?.id]
    );

    return res.json({
      summary: {
        attendance_reports: attendance.rows[0]?.count || 0,
        payroll_reports: payroll.rows[0]?.count || 0,
        employee_reports: employees.rows[0]?.count || 0,
        project_reports: projects.rows[0]?.count || 0,
        task_reports: tasks.rows[0]?.count || 0,
        exports: 0,
      },
    });
  } catch (error) {
    console.error("Reports summary error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getReportData(req, res) {
  try {
    const { type } = req.params;
    const employee = await getEmployeeByUser(req.user.id);

    if (type === "attendance") {
      const result = await query(
        `
        SELECT
          ar.*,
          u.full_name,
          d.name AS department
        FROM attendance_records ar
        JOIN employees e ON e.id = ar.employee_id
        JOIN app_users u ON u.id = e.user_id
        LEFT JOIN departments d ON d.id = e.department_id
        ${
          req.user.role === "admin"
            ? ""
            : "WHERE e.user_id = $1"
        }
        ORDER BY ar.attendance_date DESC
        LIMIT 200
        `,
        req.user.role === "admin" ? [] : [req.user.id]
      );

      return res.json({ rows: result.rows });
    }

    if (type === "payroll") {
      const result = await query(
        `
        SELECT
          pi.*,
          pr.payroll_month,
          pr.payroll_year,
          u.full_name,
          d.name AS department
        FROM payroll_items pi
        JOIN payroll_runs pr ON pr.id = pi.payroll_run_id
        JOIN employees e ON e.id = pi.employee_id
        JOIN app_users u ON u.id = e.user_id
        LEFT JOIN departments d ON d.id = e.department_id
        ${
          req.user.role === "admin"
            ? ""
            : "WHERE e.user_id = $1"
        }
        ORDER BY pr.payroll_year DESC, pr.payroll_month DESC
        LIMIT 200
        `,
        req.user.role === "admin" ? [] : [req.user.id]
      );

      return res.json({ rows: result.rows });
    }

    if (type === "employees") {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const result = await query(`
        SELECT
          e.employee_code,
          u.full_name,
          u.email,
          u.role,
          d.name AS department,
          dg.name AS designation,
          e.status,
          e.joining_date
        FROM employees e
        JOIN app_users u ON u.id = e.user_id
        LEFT JOIN departments d ON d.id = e.department_id
        LEFT JOIN designations dg ON dg.id = e.designation_id
        WHERE e.deleted_at IS NULL
        ORDER BY u.full_name ASC
      `);

      return res.json({ rows: result.rows });
    }

    if (type === "projects") {
      const result = await query(
        `
        SELECT
          p.*,
          u.full_name AS manager_name
        FROM projects p
        LEFT JOIN employees e ON e.id = p.manager_id
        LEFT JOIN app_users u ON u.id = e.user_id
        ${
          req.user.role === "admin"
            ? ""
            : "WHERE p.manager_id = $1 OR EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id=p.id AND pm.employee_id=$1)"
        }
        ORDER BY p.created_at DESC
        LIMIT 200
        `,
        req.user.role === "admin" ? [] : [employee?.id]
      );

      return res.json({ rows: result.rows });
    }

    if (type === "tasks") {
      const result = await query(
        `
        SELECT
          t.*,
          p.title AS project_title,
          u.full_name AS assigned_name
        FROM tasks t
        LEFT JOIN projects p ON p.id = t.project_id
        LEFT JOIN employees e ON e.id = t.assigned_to
        LEFT JOIN app_users u ON u.id = e.user_id
        ${
          req.user.role === "admin"
            ? ""
            : "WHERE t.assigned_to = $1"
        }
        ORDER BY t.created_at DESC
        LIMIT 200
        `,
        req.user.role === "admin" ? [] : [employee?.id]
      );

      return res.json({ rows: result.rows });
    }

    return res.status(400).json({ message: "Invalid report type" });
  } catch (error) {
    console.error("Report data error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}