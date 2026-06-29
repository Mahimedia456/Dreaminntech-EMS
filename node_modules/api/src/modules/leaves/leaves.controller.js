import { query } from "../../config/db.js";
import { sendLeaveEmail } from "./leaveMailer.js";

async function getEmployeeByUser(userId) {
  const result = await query(
    `
    SELECT e.*, u.full_name, u.email, u.role
    FROM employees e
    JOIN app_users u ON u.id = e.user_id
    WHERE e.user_id = $1
    AND e.deleted_at IS NULL
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0];
}

function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.floor((e - s) / 86400000) + 1;
  return Math.max(1, diff);
}

export async function getLeaveTypes(req, res) {
  try {
    const result = await query(`
      SELECT *
      FROM leave_types
      WHERE status = 'active'
      ORDER BY name ASC
    `);

    return res.json({ types: result.rows });
  } catch (error) {
    console.error("Get leave types error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getLeaveBalances(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const result = await query(
      `
      SELECT
        lb.*,
        lt.name AS leave_type,
        lt.code,
        lt.color
      FROM leave_balances lb
      JOIN leave_types lt ON lt.id = lb.leave_type_id
      WHERE lb.employee_id = $1
      AND lb.year = EXTRACT(YEAR FROM CURRENT_DATE)::int
      ORDER BY lt.name ASC
      `,
      [employee.id]
    );

    return res.json({ balances: result.rows });
  } catch (error) {
    console.error("Get leave balances error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getLeaveRequests(req, res) {
  try {
    const user = req.user;
    const employee = await getEmployeeByUser(user.id);

    const params = [];
    let where = "WHERE 1=1";

    if (user.role === "employee") {
      params.push(employee.id);
      where += ` AND lr.employee_id = $${params.length}`;
    }

    const result = await query(
      `
      SELECT
        lr.*,
        lt.name AS leave_type,
        lt.code AS leave_code,
        lt.color,
        u.full_name AS employee_name,
        u.email AS employee_email,
        e.employee_code,
        approver.full_name AS approved_by_name
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      JOIN app_users u ON u.id = e.user_id
      JOIN leave_types lt ON lt.id = lr.leave_type_id
      LEFT JOIN app_users approver ON approver.id = lr.approved_by
      ${where}
      ORDER BY lr.created_at DESC
      `,
      params
    );

    return res.json({ requests: result.rows });
  } catch (error) {
    console.error("Get leave requests error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createLeaveRequest(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const { leave_type_id, start_date, end_date, reason } = req.body;

    if (!leave_type_id || !start_date || !end_date) {
      return res.status(400).json({ message: "Leave type, start date and end date are required" });
    }

    const totalDays = daysBetween(start_date, end_date);

    const balanceResult = await query(
      `
      SELECT *
      FROM leave_balances
      WHERE employee_id = $1
      AND leave_type_id = $2
      AND year = EXTRACT(YEAR FROM CURRENT_DATE)::int
      LIMIT 1
      `,
      [employee.id, leave_type_id]
    );

    const balance = balanceResult.rows[0];

    if (balance && Number(balance.remaining_days) < totalDays) {
      return res.status(400).json({ message: "Insufficient leave balance" });
    }

    const result = await query(
      `
      INSERT INTO leave_requests
      (employee_id, leave_type_id, start_date, end_date, total_days, reason, status)
      VALUES ($1,$2,$3,$4,$5,$6,'pending')
      RETURNING *
      `,
      [employee.id, leave_type_id, start_date, end_date, totalDays, reason || ""]
    );

    const managers = await query(`
      SELECT email
      FROM app_users
      WHERE role IN ('admin','manager')
      AND status = 'active'
    `);

    for (const manager of managers.rows) {
      await sendLeaveEmail({
        to: manager.email,
        subject: "New Leave Request - Dream EMS",
        title: "New Leave Request",
        subtitle: `${employee.full_name} submitted a leave request.`,
        content: `
          <p><strong>Employee:</strong> ${employee.full_name}</p>
          <p><strong>Dates:</strong> ${start_date} to ${end_date}</p>
          <p><strong>Total Days:</strong> ${totalDays}</p>
          <p><strong>Reason:</strong> ${reason || "-"}</p>
        `,
      });
    }

    return res.status(201).json({
      message: "Leave request submitted",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Create leave request error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function approveLeaveRequest(req, res) {
  try {
    const { id } = req.params;

    const requestResult = await query(
      `
      SELECT lr.*, lt.name AS leave_type, u.email, u.full_name
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      JOIN app_users u ON u.id = e.user_id
      JOIN leave_types lt ON lt.id = lr.leave_type_id
      WHERE lr.id = $1
      LIMIT 1
      `,
      [id]
    );

    const request = requestResult.rows[0];

    if (!request) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be approved" });
    }

    await query("BEGIN");

    await query(
      `
      UPDATE leave_requests
      SET status='approved',
          approved_by=$1,
          approved_at=NOW(),
          updated_at=NOW()
      WHERE id=$2
      `,
      [req.user.id, id]
    );

    await query(
      `
      UPDATE leave_balances
      SET used_days = used_days + $1,
          remaining_days = remaining_days - $1
      WHERE employee_id = $2
      AND leave_type_id = $3
      AND year = EXTRACT(YEAR FROM CURRENT_DATE)::int
      `,
      [request.total_days, request.employee_id, request.leave_type_id]
    );

    await query("COMMIT");

    await sendLeaveEmail({
      to: request.email,
      subject: "Leave Approved - Dream EMS",
      title: "Leave Approved",
      subtitle: "Your leave request has been approved.",
      content: `
        <p><strong>Leave Type:</strong> ${request.leave_type}</p>
        <p><strong>Dates:</strong> ${request.start_date} to ${request.end_date}</p>
        <p><strong>Total Days:</strong> ${request.total_days}</p>
      `,
    });

    return res.json({ message: "Leave approved successfully" });
  } catch (error) {
    await query("ROLLBACK").catch(() => {});
    console.error("Approve leave error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function rejectLeaveRequest(req, res) {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const requestResult = await query(
      `
      SELECT lr.*, lt.name AS leave_type, u.email, u.full_name
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      JOIN app_users u ON u.id = e.user_id
      JOIN leave_types lt ON lt.id = lr.leave_type_id
      WHERE lr.id = $1
      LIMIT 1
      `,
      [id]
    );

    const request = requestResult.rows[0];

    if (!request) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be rejected" });
    }

    await query(
      `
      UPDATE leave_requests
      SET status='rejected',
          approved_by=$1,
          approved_at=NOW(),
          rejection_reason=$2,
          updated_at=NOW()
      WHERE id=$3
      `,
      [req.user.id, rejection_reason || "", id]
    );

    await sendLeaveEmail({
      to: request.email,
      subject: "Leave Rejected - Dream EMS",
      title: "Leave Rejected",
      subtitle: "Your leave request has been rejected.",
      content: `
        <p><strong>Leave Type:</strong> ${request.leave_type}</p>
        <p><strong>Dates:</strong> ${request.start_date} to ${request.end_date}</p>
        <p><strong>Reason:</strong> ${rejection_reason || "-"}</p>
      `,
    });

    return res.json({ message: "Leave rejected successfully" });
  } catch (error) {
    console.error("Reject leave error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function cancelLeaveRequest(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    const result = await query(
      `
      UPDATE leave_requests
      SET status='cancelled',
          updated_at=NOW()
      WHERE id=$1
      AND employee_id=$2
      AND status='pending'
      RETURNING *
      `,
      [req.params.id, employee.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Pending leave request not found" });
    }

    return res.json({ message: "Leave request cancelled" });
  } catch (error) {
    console.error("Cancel leave error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}