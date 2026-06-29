import { query } from "../../config/db.js";
import { hashPassword } from "../../utils/password.js";

function fullName(firstName, lastName) {
  return `${firstName || ""} ${lastName || ""}`.trim();
}

export async function getEmployees(req, res) {
  try {
    const result = await query(`
      SELECT
        e.id,
        e.employee_code,
        e.first_name,
        e.last_name,
        e.phone,
        e.basic_salary,
        e.status,
        e.joining_date,
        u.id AS user_id,
        u.full_name,
        u.email,
        u.role,
        d.name AS department,
        dg.name AS designation,
        s.name AS shift
      FROM employees e
      JOIN app_users u ON u.id = e.user_id
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN designations dg ON dg.id = e.designation_id
      LEFT JOIN shifts s ON s.id = e.shift_id
      WHERE e.deleted_at IS NULL
      ORDER BY e.employee_code ASC
    `);

    return res.json({ employees: result.rows });
  } catch (error) {
    console.error("Get employees error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getEmployeeDetail(req, res) {
  try {
    const result = await query(
      `
      SELECT
        e.*,
        u.username,
        u.full_name,
        u.email,
        u.role,
        u.status AS user_status,
        d.name AS department,
        dg.name AS designation,
        s.name AS shift,
        s.start_time,
        s.end_time,
        s.break_minutes,
        s.grace_minutes
      FROM employees e
      JOIN app_users u ON u.id = e.user_id
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN designations dg ON dg.id = e.designation_id
      LEFT JOIN shifts s ON s.id = e.shift_id
      WHERE e.id = $1
      AND e.deleted_at IS NULL
      LIMIT 1
      `,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const docs = await query(
      `
      SELECT *
      FROM employee_documents
      WHERE employee_id = $1
      ORDER BY uploaded_at DESC
      `,
      [req.params.id]
    );

    return res.json({
      employee: result.rows[0],
      documents: docs.rows,
    });
  } catch (error) {
    console.error("Get employee detail error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createEmployee(req, res) {
  try {
    const body = req.body;

    if (!body.email || !body.first_name) {
      return res.status(400).json({
        message: "First name and email are required",
      });
    }

    const passwordHash = await hashPassword(
      body.password || "Mahimediasolutions@786"
    );

    const userResult = await query(
      `
      INSERT INTO app_users
      (username, full_name, email, password_hash, role, status)
      VALUES ($1,$2,$3,$4,$5,'active')
      RETURNING id, username, full_name, email, role
      `,
      [
        body.username || body.email.split("@")[0],
        fullName(body.first_name, body.last_name),
        body.email,
        passwordHash,
        body.role || "employee",
      ]
    );

    const user = userResult.rows[0];

    const employeeResult = await query(
      `
      INSERT INTO employees (
        user_id,
        employee_code,
        department_id,
        designation_id,
        shift_id,
        first_name,
        last_name,
        phone,
        cnic,
        gender,
        date_of_birth,
        address,
        joining_date,
        employment_type,
        basic_salary,
        medical_allowance,
        fuel_allowance,
        food_allowance,
        overtime_rate,
        bank_name,
        account_number,
        iban,
        annual_leaves,
        casual_leaves,
        sick_leaves,
        status
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
        $14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,'active'
      )
      RETURNING *
      `,
      [
        user.id,
        body.employee_code || `EMP-${Date.now()}`,
        body.department_id || null,
        body.designation_id || null,
        body.shift_id || null,
        body.first_name || "",
        body.last_name || "",
        body.phone || "",
        body.cnic || "",
        body.gender || "",
        body.date_of_birth || null,
        body.address || "",
        body.joining_date || null,
        body.employment_type || "full_time",
        body.basic_salary || 0,
        body.medical_allowance || 0,
        body.fuel_allowance || 0,
        body.food_allowance || 0,
        body.overtime_rate || 0,
        body.bank_name || "",
        body.account_number || "",
        body.iban || "",
        body.annual_leaves || 18,
        body.casual_leaves || 10,
        body.sick_leaves || 10,
      ]
    );

    return res.status(201).json({
      message: "Employee created successfully",
      user,
      employee: employeeResult.rows[0],
    });
  } catch (error) {
    console.error("Create employee error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email, username or employee code already exists",
      });
    }

    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;

    const currentResult = await query(
      `
      SELECT e.*, u.id AS user_id
      FROM employees e
      JOIN app_users u ON u.id = e.user_id
      WHERE e.id = $1
      AND e.deleted_at IS NULL
      LIMIT 1
      `,
      [id]
    );

    const current = currentResult.rows[0];

    if (!current) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await query(
      `
      UPDATE app_users
      SET
        username = COALESCE($1, username),
        full_name = COALESCE($2, full_name),
        email = COALESCE($3, email),
        role = COALESCE($4, role),
        updated_at = NOW()
      WHERE id = $5
      `,
      [
        body.username || null,
        fullName(body.first_name, body.last_name) || null,
        body.email || null,
        body.role || null,
        current.user_id,
      ]
    );

    const employeeResult = await query(
      `
      UPDATE employees
      SET
        employee_code = COALESCE($1, employee_code),
        department_id = $2,
        designation_id = $3,
        shift_id = $4,
        first_name = COALESCE($5, first_name),
        last_name = COALESCE($6, last_name),
        phone = COALESCE($7, phone),
        cnic = COALESCE($8, cnic),
        gender = COALESCE($9, gender),
        date_of_birth = $10,
        address = COALESCE($11, address),
        joining_date = $12,
        employment_type = COALESCE($13, employment_type),
        basic_salary = COALESCE($14, basic_salary),
        medical_allowance = COALESCE($15, medical_allowance),
        fuel_allowance = COALESCE($16, fuel_allowance),
        food_allowance = COALESCE($17, food_allowance),
        overtime_rate = COALESCE($18, overtime_rate),
        bank_name = COALESCE($19, bank_name),
        account_number = COALESCE($20, account_number),
        iban = COALESCE($21, iban),
        annual_leaves = COALESCE($22, annual_leaves),
        casual_leaves = COALESCE($23, casual_leaves),
        sick_leaves = COALESCE($24, sick_leaves),
        status = COALESCE($25, status),
        updated_at = NOW()
      WHERE id = $26
      RETURNING *
      `,
      [
        body.employee_code || null,
        body.department_id || null,
        body.designation_id || null,
        body.shift_id || null,
        body.first_name || null,
        body.last_name || null,
        body.phone || null,
        body.cnic || null,
        body.gender || null,
        body.date_of_birth || null,
        body.address || null,
        body.joining_date || null,
        body.employment_type || null,
        body.basic_salary || null,
        body.medical_allowance || null,
        body.fuel_allowance || null,
        body.food_allowance || null,
        body.overtime_rate || null,
        body.bank_name || null,
        body.account_number || null,
        body.iban || null,
        body.annual_leaves || null,
        body.casual_leaves || null,
        body.sick_leaves || null,
        body.status || null,
        id,
      ]
    );

    return res.json({
      message: "Employee updated successfully",
      employee: employeeResult.rows[0],
    });
  } catch (error) {
    console.error("Update employee error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email, username or employee code already exists",
      });
    }

    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;

    const result = await query(
      `
      UPDATE employees
      SET deleted_at = NOW(),
          status = 'terminated',
          updated_at = NOW()
      WHERE id = $1
      RETURNING user_id
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await query(
      `
      UPDATE app_users
      SET status = 'inactive',
          updated_at = NOW()
      WHERE id = $1
      `,
      [result.rows[0].user_id]
    );

    return res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete employee error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getDepartments(req, res) {
  try {
    const result = await query(`
      SELECT
        d.*,
        COUNT(e.id)::int AS employees_count
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id AND e.deleted_at IS NULL
      GROUP BY d.id
      ORDER BY d.name ASC
    `);

    return res.json({ departments: result.rows });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getDesignations(req, res) {
  try {
    const result = await query(`
      SELECT
        dg.*,
        d.name AS department,
        COUNT(e.id)::int AS employees_count
      FROM designations dg
      LEFT JOIN departments d ON d.id = dg.department_id
      LEFT JOIN employees e ON e.designation_id = dg.id AND e.deleted_at IS NULL
      GROUP BY dg.id, d.name
      ORDER BY dg.name ASC
    `);

    return res.json({ designations: result.rows });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getShifts(req, res) {
  try {
    const result = await query(`
      SELECT
        s.*,
        COUNT(e.id)::int AS employees_count
      FROM shifts s
      LEFT JOIN employees e ON e.shift_id = s.id AND e.deleted_at IS NULL
      GROUP BY s.id
      ORDER BY s.start_time ASC
    `);

    return res.json({ shifts: result.rows });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
export async function createDepartment(req, res) {
  try {
    const { name, code, description, status } = req.body;

    const result = await query(
      `
      INSERT INTO departments (name, code, description, status)
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [name, code || null, description || "", status || "active"]
    );

    return res.status(201).json({
      message: "Department created",
      department: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function updateDepartment(req, res) {
  try {
    const { name, code, description, status } = req.body;

    const result = await query(
      `
      UPDATE departments
      SET name=$1, code=$2, description=$3, status=$4, updated_at=NOW()
      WHERE id=$5
      RETURNING *
      `,
      [name, code || null, description || "", status || "active", req.params.id]
    );

    return res.json({
      message: "Department updated",
      department: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function deleteDepartment(req, res) {
  try {
    await query(`DELETE FROM departments WHERE id=$1`, [req.params.id]);
    return res.json({ message: "Department deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function createDesignation(req, res) {
  try {
    const { department_id, name, description, status } = req.body;

    const result = await query(
      `
      INSERT INTO designations (department_id, name, description, status)
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [department_id || null, name, description || "", status || "active"]
    );

    return res.status(201).json({
      message: "Designation created",
      designation: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function updateDesignation(req, res) {
  try {
    const { department_id, name, description, status } = req.body;

    const result = await query(
      `
      UPDATE designations
      SET department_id=$1, name=$2, description=$3, status=$4, updated_at=NOW()
      WHERE id=$5
      RETURNING *
      `,
      [department_id || null, name, description || "", status || "active", req.params.id]
    );

    return res.json({
      message: "Designation updated",
      designation: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function deleteDesignation(req, res) {
  try {
    await query(`DELETE FROM designations WHERE id=$1`, [req.params.id]);
    return res.json({ message: "Designation deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function createShift(req, res) {
  try {
    const {
      name,
      start_time,
      end_time,
      break_minutes,
      grace_minutes,
      late_deduction_type,
      status,
    } = req.body;

    const result = await query(
      `
      INSERT INTO shifts
      (name, start_time, end_time, break_minutes, grace_minutes, late_deduction_type, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        name,
        start_time,
        end_time,
        break_minutes || 60,
        grace_minutes || 15,
        late_deduction_type || "per_minute",
        status || "active",
      ]
    );

    return res.status(201).json({
      message: "Shift created",
      shift: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function updateShift(req, res) {
  try {
    const {
      name,
      start_time,
      end_time,
      break_minutes,
      grace_minutes,
      late_deduction_type,
      status,
    } = req.body;

    const result = await query(
      `
      UPDATE shifts
      SET
        name=$1,
        start_time=$2,
        end_time=$3,
        break_minutes=$4,
        grace_minutes=$5,
        late_deduction_type=$6,
        status=$7,
        updated_at=NOW()
      WHERE id=$8
      RETURNING *
      `,
      [
        name,
        start_time,
        end_time,
        break_minutes || 60,
        grace_minutes || 15,
        late_deduction_type || "per_minute",
        status || "active",
        req.params.id,
      ]
    );

    return res.json({
      message: "Shift updated",
      shift: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function deleteShift(req, res) {
  try {
    await query(`DELETE FROM shifts WHERE id=$1`, [req.params.id]);
    return res.json({ message: "Shift deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
}