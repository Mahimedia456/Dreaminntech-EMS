import { query } from "../../config/db.js";

export async function getCompanySettings(req, res) {
  try {
    const result = await query(`
      SELECT *
      FROM company_settings
      ORDER BY created_at ASC
      LIMIT 1
    `);

    return res.json({
      settings: result.rows[0] || null,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateCompanySettings(req, res) {
  try {
    const body = req.body;

    const current = await query(`
      SELECT id
      FROM company_settings
      ORDER BY created_at ASC
      LIMIT 1
    `);

    if (!current.rows.length) {
      const created = await query(
        `
        INSERT INTO company_settings (
          company_name,
          email,
          phone,
          address,
          timezone,
          currency,
          working_days,
          office_start,
          office_end,
          grace_minutes,
          smtp_host,
          smtp_port,
          smtp_username,
          smtp_password,
          smtp_secure
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        RETURNING *
        `,
        [
          body.company_name || "Dream InnTech",
          body.email || "",
          body.phone || "",
          body.address || "",
          body.timezone || "Asia/Karachi",
          body.currency || "PKR",
          body.working_days || "monday_friday",
          body.office_start || "09:00",
          body.office_end || "18:00",
          body.grace_minutes || 15,
          body.smtp_host || "",
          body.smtp_port || "",
          body.smtp_username || "",
          body.smtp_password || "",
          body.smtp_secure ?? true,
        ]
      );

      return res.status(201).json({
        message: "Settings created",
        settings: created.rows[0],
      });
    }

    const result = await query(
      `
      UPDATE company_settings
      SET
        company_name=$1,
        email=$2,
        phone=$3,
        address=$4,
        timezone=$5,
        currency=$6,
        working_days=$7,
        office_start=$8,
        office_end=$9,
        grace_minutes=$10,
        smtp_host=$11,
        smtp_port=$12,
        smtp_username=$13,
        smtp_password=$14,
        smtp_secure=$15,
        updated_at=NOW()
      WHERE id=$16
      RETURNING *
      `,
      [
        body.company_name || "",
        body.email || "",
        body.phone || "",
        body.address || "",
        body.timezone || "Asia/Karachi",
        body.currency || "PKR",
        body.working_days || "monday_friday",
        body.office_start || "09:00",
        body.office_end || "18:00",
        body.grace_minutes || 15,
        body.smtp_host || "",
        body.smtp_port || "",
        body.smtp_username || "",
        body.smtp_password || "",
        body.smtp_secure ?? true,
        current.rows[0].id,
      ]
    );

    return res.json({
      message: "Settings updated",
      settings: result.rows[0],
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function getRolePermissions(req, res) {
  try {
    const result = await query(`
      SELECT *
      FROM role_permissions
      ORDER BY module_key ASC, role ASC
    `);

    return res.json({
      permissions: result.rows,
    });
  } catch (error) {
    console.error("Get permissions error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateRolePermissions(req, res) {
  try {
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "Permissions array is required" });
    }

    await query("BEGIN");

    for (const item of permissions) {
      await query(
        `
        INSERT INTO role_permissions
        (role, module_key, can_access)
        VALUES ($1,$2,$3)
        ON CONFLICT (role, module_key)
        DO UPDATE SET
          can_access=EXCLUDED.can_access,
          updated_at=NOW()
        `,
        [item.role, item.module_key, Boolean(item.can_access)]
      );
    }

    await query("COMMIT");

    return res.json({ message: "Permissions updated" });
  } catch (error) {
    await query("ROLLBACK").catch(() => {});
    console.error("Update permissions error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}