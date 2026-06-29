import { query } from "../../config/db.js";

function minutesBetween(start, end) {
  if (!start || !end) return 0;
  return Math.max(0, Math.floor((new Date(end) - new Date(start)) / 60000));
}

function formatToday() {
  return new Date().toISOString().slice(0, 10);
}

async function getEmployeeByUser(userId) {
  const result = await query(
    `
    SELECT
      e.*,
      u.full_name,
      u.email,
      u.role,
      s.start_time,
      s.end_time,
      s.grace_minutes
    FROM employees e
    JOIN app_users u ON u.id = e.user_id
    LEFT JOIN shifts s ON s.id = e.shift_id
    WHERE e.user_id = $1
    AND e.deleted_at IS NULL
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0];
}

async function getOrCreateTodayAttendance(employeeId) {
  const today = formatToday();

  const existing = await query(
    `
    SELECT *
    FROM attendance_records
    WHERE employee_id = $1
    AND attendance_date = $2
    LIMIT 1
    `,
    [employeeId, today]
  );

  if (existing.rows[0]) return existing.rows[0];

  const created = await query(
    `
    INSERT INTO attendance_records
    (employee_id, attendance_date, status)
    VALUES ($1, $2, 'not_started')
    RETURNING *
    `,
    [employeeId, today]
  );

  return created.rows[0];
}

async function recalculateAttendance(attendanceId) {
  const result = await query(
    `
    SELECT ar.*, e.shift_id, s.start_time, s.end_time, s.grace_minutes
    FROM attendance_records ar
    JOIN employees e ON e.id = ar.employee_id
    LEFT JOIN shifts s ON s.id = e.shift_id
    WHERE ar.id = $1
    LIMIT 1
    `,
    [attendanceId]
  );

  const row = result.rows[0];
  if (!row) return null;

  const lunchMinutes = minutesBetween(row.lunch_out, row.lunch_in);
  const breakMinutes = minutesBetween(row.break_out, row.break_in);

  let workingMinutes = 0;

  if (row.check_in && row.check_out) {
    workingMinutes =
      minutesBetween(row.check_in, row.check_out) - lunchMinutes - breakMinutes;
  }

  let lateMinutes = 0;

  if (row.check_in && row.start_time) {
    const checkIn = new Date(row.check_in);
    const shiftStart = new Date(row.check_in);
    const [h, m] = String(row.start_time).split(":");

    shiftStart.setHours(Number(h), Number(m), 0, 0);

    const allowedStart = new Date(shiftStart);
    allowedStart.setMinutes(
      allowedStart.getMinutes() + Number(row.grace_minutes || 0)
    );

    lateMinutes = Math.max(0, Math.floor((checkIn - allowedStart) / 60000));
  }

  const standardMinutes = 8 * 60;
  const overtimeMinutes = Math.max(0, workingMinutes - standardMinutes);

  const updated = await query(
    `
    UPDATE attendance_records
    SET
      working_minutes = $1,
      lunch_minutes = $2,
      break_minutes = $3,
      overtime_minutes = $4,
      late_minutes = $5,
      updated_at = NOW()
    WHERE id = $6
    RETURNING *
    `,
    [
      workingMinutes,
      lunchMinutes,
      breakMinutes,
      overtimeMinutes,
      lateMinutes,
      attendanceId,
    ]
  );

  return updated.rows[0];
}

function applyAttendanceRoleFilters({ req, employee, params, filters }) {
  if (req.user.role === "admin") {
    return;
  }

  if (req.user.role === "manager") {
    params.push(employee.id);
    const managerParam = params.length;

    filters.push(`
      (
        ar.employee_id = $${managerParam}
        OR EXISTS (
          SELECT 1
          FROM project_members pm
          JOIN projects p ON p.id = pm.project_id
          WHERE pm.employee_id = ar.employee_id
          AND p.manager_id = $${managerParam}
        )
      )
    `);

    return;
  }

  params.push(employee.id);
  filters.push(`ar.employee_id = $${params.length}`);
}

export async function getTodayAttendance(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const attendance = await getOrCreateTodayAttendance(employee.id);
    const updated = await recalculateAttendance(attendance.id);

    return res.json({
      employee,
      attendance: updated || attendance,
    });
  } catch (error) {
    console.error("Today attendance error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function checkIn(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const attendance = await getOrCreateTodayAttendance(employee.id);

    if (attendance.check_in) {
      return res.status(400).json({ message: "Already checked in" });
    }

    const result = await query(
      `
      UPDATE attendance_records
      SET check_in = NOW(), status = 'working', updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [attendance.id]
    );

    const updated = await recalculateAttendance(result.rows[0].id);

    return res.json({
      message: "Checked in successfully",
      attendance: updated,
    });
  } catch (error) {
    console.error("Check in error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function lunchOut(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const attendance = await getOrCreateTodayAttendance(employee.id);

    if (!attendance.check_in) {
      return res.status(400).json({ message: "Check in first" });
    }

    if (attendance.lunch_out) {
      return res.status(400).json({ message: "Lunch out already marked" });
    }

    const result = await query(
      `
      UPDATE attendance_records
      SET lunch_out = NOW(), status = 'lunch', updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [attendance.id]
    );

    return res.json({
      message: "Lunch out marked",
      attendance: result.rows[0],
    });
  } catch (error) {
    console.error("Lunch out error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function lunchIn(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const attendance = await getOrCreateTodayAttendance(employee.id);

    if (!attendance.lunch_out) {
      return res.status(400).json({ message: "Lunch out first" });
    }

    if (attendance.lunch_in) {
      return res.status(400).json({ message: "Lunch in already marked" });
    }

    const result = await query(
      `
      UPDATE attendance_records
      SET lunch_in = NOW(), status = 'working', updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [attendance.id]
    );

    const updated = await recalculateAttendance(result.rows[0].id);

    return res.json({
      message: "Lunch in marked",
      attendance: updated,
    });
  } catch (error) {
    console.error("Lunch in error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function breakOut(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const attendance = await getOrCreateTodayAttendance(employee.id);

    if (!attendance.check_in) {
      return res.status(400).json({ message: "Check in first" });
    }

    if (attendance.break_out) {
      return res.status(400).json({ message: "Break out already marked" });
    }

    const result = await query(
      `
      UPDATE attendance_records
      SET break_out = NOW(), status = 'break', updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [attendance.id]
    );

    return res.json({
      message: "Break out marked",
      attendance: result.rows[0],
    });
  } catch (error) {
    console.error("Break out error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function breakIn(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const attendance = await getOrCreateTodayAttendance(employee.id);

    if (!attendance.break_out) {
      return res.status(400).json({ message: "Break out first" });
    }

    if (attendance.break_in) {
      return res.status(400).json({ message: "Break in already marked" });
    }

    const result = await query(
      `
      UPDATE attendance_records
      SET break_in = NOW(), status = 'working', updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [attendance.id]
    );

    const updated = await recalculateAttendance(result.rows[0].id);

    return res.json({
      message: "Break in marked",
      attendance: updated,
    });
  } catch (error) {
    console.error("Break in error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function checkOut(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const attendance = await getOrCreateTodayAttendance(employee.id);

    if (!attendance.check_in) {
      return res.status(400).json({ message: "Check in first" });
    }

    if (attendance.check_out) {
      return res.status(400).json({ message: "Already checked out" });
    }

    const result = await query(
      `
      UPDATE attendance_records
      SET check_out = NOW(), status = 'completed', updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [attendance.id]
    );

    const updated = await recalculateAttendance(result.rows[0].id);

    return res.json({
      message: "Checked out successfully",
      attendance: updated,
    });
  } catch (error) {
    console.error("Check out error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function submitDailyReport(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const attendance = await getOrCreateTodayAttendance(employee.id);

    const { completed_tasks, work_summary, issues, tomorrow_plan } = req.body;

    const result = await query(
      `
      INSERT INTO daily_work_reports
      (employee_id, attendance_id, completed_tasks, work_summary, issues, tomorrow_plan)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        employee.id,
        attendance.id,
        completed_tasks || "",
        work_summary || "",
        issues || "",
        tomorrow_plan || "",
      ]
    );

    return res.status(201).json({
      message: "Daily report submitted",
      report: result.rows[0],
    });
  } catch (error) {
    console.error("Daily report error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getAttendanceHistory(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const { from, to, employeeId, status, departmentId } = req.query;

    const params = [];
    const filters = [];

    applyAttendanceRoleFilters({
      req,
      employee,
      params,
      filters,
    });

    if (from) {
      params.push(from);
      filters.push(`ar.attendance_date >= $${params.length}`);
    }

    if (to) {
      params.push(to);
      filters.push(`ar.attendance_date <= $${params.length}`);
    }

    if (status && status !== "all") {
      params.push(status);
      filters.push(`ar.status = $${params.length}`);
    }

    if (departmentId && departmentId !== "all") {
      params.push(departmentId);
      filters.push(`e.department_id = $${params.length}`);
    }

    if (employeeId && employeeId !== "all") {
      if (req.user.role === "admin") {
        params.push(employeeId);
        filters.push(`ar.employee_id = $${params.length}`);
      }

      if (req.user.role === "manager") {
        params.push(employeeId);
        const selectedEmployeeParam = params.length;

        params.push(employee.id);
        const managerParam = params.length;

        filters.push(`
          ar.employee_id = $${selectedEmployeeParam}
          AND (
            ar.employee_id = $${managerParam}
            OR EXISTS (
              SELECT 1
              FROM project_members pm
              JOIN projects p ON p.id = pm.project_id
              WHERE pm.employee_id = ar.employee_id
              AND p.manager_id = $${managerParam}
            )
          )
        `);
      }
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const result = await query(
      `
      SELECT
        ar.*,
        u.full_name,
        u.email,
        e.employee_code,
        d.name AS department,
        dg.name AS designation,
        s.name AS shift_name
      FROM attendance_records ar
      JOIN employees e ON e.id = ar.employee_id
      JOIN app_users u ON u.id = e.user_id
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN designations dg ON dg.id = e.designation_id
      LEFT JOIN shifts s ON s.id = e.shift_id
      ${where}
      ORDER BY ar.attendance_date DESC, u.full_name ASC
      LIMIT 500
      `,
      params
    );

    return res.json({
      role: req.user.role,
      records: result.rows,
    });
  } catch (error) {
    console.error("Attendance history error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function getAttendanceSummary(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const params = [];
    const filters = [`ar.attendance_date = CURRENT_DATE`];

    applyAttendanceRoleFilters({
      req,
      employee,
      params,
      filters,
    });

    const where = `WHERE ${filters.join(" AND ")}`;

    const result = await query(
      `
      SELECT
        COUNT(*) FILTER (WHERE ar.status IN ('working','completed','late'))::int AS present,
        COUNT(*) FILTER (WHERE ar.late_minutes > 0)::int AS late,
        COUNT(*) FILTER (WHERE ar.status = 'absent')::int AS absent,
        COUNT(*) FILTER (WHERE ar.status = 'leave')::int AS leaves,
        COUNT(*)::int AS total_records
      FROM attendance_records ar
      JOIN employees e ON e.id = ar.employee_id
      ${where}
      `,
      params
    );

    return res.json({
      role: req.user.role,
      summary: result.rows[0],
    });
  } catch (error) {
    console.error("Attendance summary error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}