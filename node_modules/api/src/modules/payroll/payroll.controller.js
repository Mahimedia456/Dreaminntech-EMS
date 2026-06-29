import { query } from "../../config/db.js";
import { generatePayslipPdf } from "./payrollPdf.js";

function getMonthRange(year, month) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${endDate}`;
  return { start, end };
}

function ceilTo30Minutes(minutes = 0) {
  return Math.ceil(Number(minutes || 0) / 30);
}

function calculatePayroll(emp) {
  const basic = Number(emp.basic_salary || 0);

  const medical = Number(emp.medical_allowance || 0);
  const fuel = Number(emp.fuel_allowance || 0);
  const food = Number(emp.food_allowance || 0);
  const allowances = medical + fuel + food;

  const shiftHours = Number(emp.shift_hours || 8) || 8;

  const perDay = basic / 30;
  const perHour = perDay / shiftHours;
  const perThirtyMinutes = perHour / 2;

  const lateBlocks = ceilTo30Minutes(emp.late_minutes || 0);
  const lateDeduction = lateBlocks * perThirtyMinutes;

  const absentDeduction = Number(emp.absent_days || 0) * perDay;
  const leaveDeduction = Number(emp.unpaid_leave_days || 0) * perDay;

  const overtimeAmount =
    (Number(emp.overtime_minutes || 0) / 60) * Number(emp.overtime_rate || 0);

  const grossSalary = basic + allowances + overtimeAmount;
  const totalDeductions = lateDeduction + absentDeduction + leaveDeduction;
  const netSalary = grossSalary - totalDeductions;

  return {
    basic,
    medical,
    fuel,
    food,
    allowances,
    lateDeduction,
    absentDeduction,
    leaveDeduction,
    overtimeAmount,
    grossSalary,
    totalDeductions,
    netSalary,
  };
}

function payrollSelectQuery(extraWhere = "") {
  return `
    SELECT
      pi.*,
      pr.payroll_month,
      pr.payroll_year,
      pr.title AS payroll_title,
      u.full_name,
      u.email,
      e.employee_code,
      d.name AS department
    FROM payroll_items pi
    JOIN payroll_runs pr ON pr.id = pi.payroll_run_id
    JOIN employees e ON e.id = pi.employee_id
    JOIN app_users u ON u.id = e.user_id
    LEFT JOIN departments d ON d.id = e.department_id
    WHERE 1=1
    ${extraWhere}
  `;
}

export async function getPayrollRuns(req, res) {
  try {
    const result = await query(`
      SELECT *
      FROM payroll_runs
      ORDER BY payroll_year DESC, payroll_month DESC
    `);

    return res.json({ runs: result.rows });
  } catch (error) {
    console.error("Get payroll runs error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getPayrollItems(req, res) {
  try {
    const params = [];
    let extraWhere = "";

    if (req.user.role === "employee" || req.user.role === "manager") {
      params.push(req.user.id);
      extraWhere += ` AND e.user_id = $${params.length}`;
    }

    const result = await query(
      `
      ${payrollSelectQuery(extraWhere)}
      ORDER BY pr.payroll_year DESC, pr.payroll_month DESC, u.full_name ASC
      `,
      params
    );

    return res.json({ items: result.rows });
  } catch (error) {
    console.error("Get payroll items error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getPayrollItemDetail(req, res) {
  try {
    const params = [req.params.id];
    let extraWhere = ` AND pi.id = $1`;

    if (req.user.role === "employee" || req.user.role === "manager") {
      params.push(req.user.id);
      extraWhere += ` AND e.user_id = $${params.length}`;
    }

    const result = await query(
      `
      ${payrollSelectQuery(extraWhere)}
      LIMIT 1
      `,
      params
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Payroll record not found" });
    }

    return res.json({ item: result.rows[0] });
  } catch (error) {
    console.error("Payroll detail error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function generatePayroll(req, res) {
  try {
    const { payroll_month, payroll_year, title } = req.body;

    if (!payroll_month || !payroll_year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const { start, end } = getMonthRange(Number(payroll_year), Number(payroll_month));

    await query("BEGIN");

    const runResult = await query(
      `
      INSERT INTO payroll_runs
      (payroll_month, payroll_year, title, status, generated_by)
      VALUES ($1,$2,$3,'generated',$4)
      ON CONFLICT (payroll_month, payroll_year)
      DO UPDATE SET
        title = EXCLUDED.title,
        status = 'generated',
        updated_at = NOW()
      RETURNING *
      `,
      [
        payroll_month,
        payroll_year,
        title || `Payroll ${payroll_month}/${payroll_year}`,
        req.user.id,
      ]
    );

    const run = runResult.rows[0];

    await query(`DELETE FROM payroll_items WHERE payroll_run_id=$1`, [run.id]);

    const employees = await query(
      `
      SELECT
        e.*,
        u.full_name,
        u.email,
        d.name AS department,

        COALESCE(
          NULLIF(EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 3600, 0),
          8
        ) AS shift_hours,

        COUNT(ar.id) FILTER (
          WHERE ar.status IN ('working','completed','late')
        )::int AS present_days,

        COUNT(ar.id) FILTER (
          WHERE ar.status = 'absent'
        )::int AS absent_days,

        COUNT(ar.id) FILTER (
          WHERE ar.late_minutes > 0
        )::int AS late_days,

        COALESCE(SUM(ar.late_minutes),0)::int AS late_minutes,
        COALESCE(SUM(ar.overtime_minutes),0)::int AS overtime_minutes,

        COALESCE(SUM(lr.total_days) FILTER (
          WHERE lr.status='approved'
          AND lt.paid_leave = FALSE
        ),0)::numeric AS unpaid_leave_days

      FROM employees e
      JOIN app_users u ON u.id = e.user_id
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN shifts s ON s.id = e.shift_id

      LEFT JOIN attendance_records ar
        ON ar.employee_id = e.id
        AND ar.attendance_date BETWEEN $1 AND $2

      LEFT JOIN leave_requests lr
        ON lr.employee_id = e.id
        AND lr.start_date BETWEEN $1 AND $2

      LEFT JOIN leave_types lt ON lt.id = lr.leave_type_id

      WHERE e.deleted_at IS NULL
      AND e.status = 'active'

      GROUP BY e.id, u.full_name, u.email, d.name, s.start_time, s.end_time
      ORDER BY u.full_name ASC
      `,
      [start, end]
    );

    for (const emp of employees.rows) {
      const calc = calculatePayroll(emp);

      await query(
        `
        INSERT INTO payroll_items (
          payroll_run_id,
          employee_id,

          basic_salary,
          medical_allowance,
          fuel_allowance,
          food_allowance,
          total_allowances,

          present_days,
          absent_days,
          late_days,
          late_minutes,
          overtime_minutes,

          late_deduction,
          absent_deduction,
          leave_deduction,
          total_deductions,

          overtime_amount,
          gross_salary,
          net_salary,

          note,
          status
        )
        VALUES
        (
          $1,$2,
          $3,$4,$5,$6,$7,
          $8,$9,$10,$11,$12,
          $13,$14,$15,$16,
          $17,$18,$19,
          $20,'generated'
        )
        `,
        [
          run.id,
          emp.id,

          calc.basic,
          calc.medical,
          calc.fuel,
          calc.food,
          calc.allowances,

          emp.present_days || 0,
          emp.absent_days || 0,
          emp.late_days || 0,
          emp.late_minutes || 0,
          emp.overtime_minutes || 0,

          calc.lateDeduction,
          calc.absentDeduction,
          calc.leaveDeduction,
          calc.totalDeductions,

          calc.overtimeAmount,
          calc.grossSalary,
          calc.netSalary,

          "We have sent you your full salary. Please be careful next time regarding attendance, leaves and late arrivals.",
        ]
      );
    }

    const totals = await query(
      `
      SELECT
        COUNT(*)::int AS total_employees,
        COALESCE(SUM(basic_salary),0) AS total_basic_salary,
        COALESCE(SUM(total_allowances),0) AS total_allowances,
        COALESCE(SUM(overtime_amount),0) AS total_overtime,
        COALESCE(SUM(total_deductions),0) AS total_deductions,
        COALESCE(SUM(net_salary),0) AS total_net_salary
      FROM payroll_items
      WHERE payroll_run_id=$1
      `,
      [run.id]
    );

    const t = totals.rows[0];

    await query(
      `
      UPDATE payroll_runs
      SET
        total_employees=$1,
        total_basic_salary=$2,
        total_allowances=$3,
        total_overtime=$4,
        total_deductions=$5,
        total_net_salary=$6,
        updated_at=NOW()
      WHERE id=$7
      `,
      [
        t.total_employees,
        t.total_basic_salary,
        t.total_allowances,
        t.total_overtime,
        t.total_deductions,
        t.total_net_salary,
        run.id,
      ]
    );

    await query("COMMIT");

    return res.status(201).json({
      message: "Payroll generated successfully",
      run_id: run.id,
    });
  } catch (error) {
    await query("ROLLBACK").catch(() => {});
    console.error("Generate payroll error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function updatePayrollItem(req, res) {
  try {
    const {
      medical_allowance,
      fuel_allowance,
      food_allowance,
      overtime_amount,
      late_deduction,
      absent_deduction,
      leave_deduction,
      note,
      status,
    } = req.body;

    const totalAllowances =
      Number(medical_allowance || 0) +
      Number(fuel_allowance || 0) +
      Number(food_allowance || 0);

    const totalDeductions =
      Number(late_deduction || 0) +
      Number(absent_deduction || 0) +
      Number(leave_deduction || 0);

    const result = await query(
      `
      UPDATE payroll_items
      SET
        medical_allowance=$1,
        fuel_allowance=$2,
        food_allowance=$3,
        total_allowances=$4,

        overtime_amount=$5,

        late_deduction=$6,
        absent_deduction=$7,
        leave_deduction=$8,
        total_deductions=$9,

        gross_salary = basic_salary + $4 + $5,
        net_salary = (basic_salary + $4 + $5) - $9,

        note=$10,
        status=$11,
        updated_at=NOW()

      WHERE id=$12
      RETURNING *
      `,
      [
        medical_allowance || 0,
        fuel_allowance || 0,
        food_allowance || 0,
        totalAllowances,

        overtime_amount || 0,

        late_deduction || 0,
        absent_deduction || 0,
        leave_deduction || 0,
        totalDeductions,

        note || "",
        status || "generated",
        req.params.id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Payroll record not found" });
    }

    return res.json({
      message: "Payroll updated successfully",
      item: result.rows[0],
    });
  } catch (error) {
    console.error("Update payroll error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function deletePayrollItem(req, res) {
  try {
    const result = await query(
      `
      DELETE FROM payroll_items
      WHERE id=$1
      RETURNING id
      `,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Payroll record not found" });
    }

    return res.json({ message: "Payroll deleted successfully" });
  } catch (error) {
    console.error("Delete payroll error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function markPayrollPaid(req, res) {
  try {
    const result = await query(
      `
      UPDATE payroll_items
      SET status='paid',
          paid_at=NOW(),
          updated_at=NOW()
      WHERE id=$1
      RETURNING *
      `,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Payroll record not found" });
    }

    return res.json({
      message: "Payroll marked as paid",
      item: result.rows[0],
    });
  } catch (error) {
    console.error("Mark paid error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function downloadPayslipPdf(req, res) {
  try {
    const params = [req.params.id];
    let extraWhere = ` AND pi.id = $1`;

    if (req.user.role === "employee" || req.user.role === "manager") {
      params.push(req.user.id);
      extraWhere += ` AND e.user_id = $${params.length}`;
    }

    const result = await query(
      `
      ${payrollSelectQuery(extraWhere)}
      LIMIT 1
      `,
      params
    );

    const item = result.rows[0];

    if (!item) {
      return res.status(404).json({ message: "Payslip not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="salary-slip-${item.employee_code}-${item.payroll_month}-${item.payroll_year}.pdf"`
    );

    const doc = generatePayslipPdf(item);

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("PDF error:", error);
    return res.status(500).json({ message: "Failed to generate PDF" });
  }
}