import { query } from "../../config/db.js";

export async function getHolidays(req, res) {
  try {
    const result = await query(`
      SELECT *
      FROM holidays
      ORDER BY holiday_date ASC
    `);

    return res.json({
      holidays: result.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch holidays",
    });
  }
}

export async function createHoliday(req, res) {
  try {
    const {
      title,
      holiday_date,
      holiday_type,
      description,
      is_paid,
      status,
    } = req.body;

    const result = await query(
      `
      INSERT INTO holidays
      (
        title,
        holiday_date,
        holiday_type,
        description,
        is_paid,
        status,
        created_by
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        title,
        holiday_date,
        holiday_type || "public",
        description || "",
        is_paid ?? true,
        status || "active",
        req.user.id,
      ]
    );

    return res.status(201).json({
      message: "Holiday created successfully",
      holiday: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to create holiday",
    });
  }
}

export async function updateHoliday(req, res) {
  try {
    const { id } = req.params;

    const {
      title,
      holiday_date,
      holiday_type,
      description,
      is_paid,
      status,
    } = req.body;

    const result = await query(
      `
      UPDATE holidays
      SET
        title=$1,
        holiday_date=$2,
        holiday_type=$3,
        description=$4,
        is_paid=$5,
        status=$6,
        updated_at=NOW()
      WHERE id=$7
      RETURNING *
      `,
      [
        title,
        holiday_date,
        holiday_type,
        description,
        is_paid,
        status,
        id,
      ]
    );

    return res.json({
      message: "Holiday updated successfully",
      holiday: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to update holiday",
    });
  }
}

export async function deleteHoliday(req, res) {
  try {
    await query(
      `
      DELETE FROM holidays
      WHERE id = $1
      `,
      [req.params.id]
    );

    return res.json({
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to delete holiday",
    });
  }
}