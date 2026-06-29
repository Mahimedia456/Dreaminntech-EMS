import { query } from "../../config/db.js";

export async function getMyProfile(req, res) {
  try {
    const result = await query(
      `
      SELECT
        u.id AS user_id,
        u.full_name,
        u.email,
        u.role,
        u.status AS user_status,
        e.id AS employee_id,
        e.employee_code,
        e.phone,
        e.cnic,
        e.gender,
        e.date_of_birth,
        e.profile_photo,
        e.address,
        e.emergency_contact_name,
        e.emergency_contact_phone,
        e.bio,
        e.joining_date,
        e.employment_type,
        e.status AS employee_status,
        d.name AS department,
        dg.name AS designation,
        s.name AS shift
      FROM app_users u
      LEFT JOIN employees e ON e.user_id = u.id
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN designations dg ON dg.id = e.designation_id
      LEFT JOIN shifts s ON s.id = e.shift_id
      WHERE u.id=$1
      LIMIT 1
      `,
      [req.user.id]
    );

    return res.json({ profile: result.rows[0] || null });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateMyProfile(req, res) {
  try {
    const {
      full_name,
      phone,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      bio,
    } = req.body;

    await query(
      `
      UPDATE app_users
      SET full_name=$1,
          updated_at=NOW()
      WHERE id=$2
      `,
      [full_name || "", req.user.id]
    );

    const employee = await query(
      `
      UPDATE employees
      SET phone=$1,
          address=$2,
          emergency_contact_name=$3,
          emergency_contact_phone=$4,
          bio=$5,
          updated_at=NOW()
      WHERE user_id=$6
      RETURNING *
      `,
      [
        phone || "",
        address || "",
        emergency_contact_name || "",
        emergency_contact_phone || "",
        bio || "",
        req.user.id,
      ]
    );

    return res.json({
      message: "Profile updated successfully",
      employee: employee.rows[0] || null,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}