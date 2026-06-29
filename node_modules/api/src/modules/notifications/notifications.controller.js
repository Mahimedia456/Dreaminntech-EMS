import { query } from "../../config/db.js";

export async function getNotifications(req, res) {
  try {
    const result = await query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 100
      `,
      [req.user.id]
    );

    return res.json({ notifications: result.rows });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getUnreadCount(req, res) {
  try {
    const result = await query(
      `
      SELECT COUNT(*)::int AS count
      FROM notifications
      WHERE user_id = $1
      AND is_read = FALSE
      `,
      [req.user.id]
    );

    return res.json({ count: result.rows[0]?.count || 0 });
  } catch (error) {
    console.error("Unread count error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const result = await query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
      AND user_id = $2
      RETURNING *
      `,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json({
      message: "Notification marked as read",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error("Mark read error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function markAllNotificationsRead(req, res) {
  try {
    await query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1
      `,
      [req.user.id]
    );

    return res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteNotification(req, res) {
  try {
    const result = await query(
      `
      DELETE FROM notifications
      WHERE id = $1
      AND user_id = $2
      RETURNING id
      `,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createNotification(req, res) {
  try {
    const {
      user_id,
      title,
      message,
      type,
      module,
      reference_id,
      icon,
      color,
    } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can create notifications" });
    }

    const result = await query(
      `
      INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        module,
        reference_id,
        icon,
        color
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        user_id,
        title,
        message || "",
        type || "system",
        module || null,
        reference_id || null,
        icon || "Bell",
        color || "blue",
      ]
    );

    return res.status(201).json({
      message: "Notification created",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}