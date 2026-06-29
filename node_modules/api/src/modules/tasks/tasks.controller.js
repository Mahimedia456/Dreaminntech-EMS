import { query } from "../../config/db.js";

async function getEmployeeByUser(userId) {
  const result = await query(
    `
    SELECT e.*, u.role, u.full_name, u.email
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

function canManageTasks(role) {
  return role === "admin" || role === "manager";
}

async function createActivity(taskId, userId, action, description) {
  await query(
    `
    INSERT INTO task_activity_logs
    (task_id, user_id, action, description)
    VALUES ($1,$2,$3,$4)
    `,
    [taskId, userId, action, description]
  );
}

export async function getTasks(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    const params = [];
    let where = "WHERE 1=1";

    if (req.user.role !== "admin") {
      params.push(employee.id);
      where += ` AND t.assigned_to = $${params.length}`;
    }

    const result = await query(
      `
      SELECT
        t.*,
        p.title AS project_title,
        p.code AS project_code,
        assigned_user.full_name AS assigned_name,
        assigned_user.email AS assigned_email,
        creator.full_name AS assigned_by_name
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN employees ae ON ae.id = t.assigned_to
      LEFT JOIN app_users assigned_user ON assigned_user.id = ae.user_id
      LEFT JOIN app_users creator ON creator.id = t.assigned_by
      ${where}
      ORDER BY
        CASE t.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        t.due_date ASC NULLS LAST,
        t.created_at DESC
      `,
      params
    );

    return res.json({ tasks: result.rows });
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getTaskDetail(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);
    const params = [req.params.id];

    let extraWhere = "";

    if (req.user.role !== "admin") {
      params.push(employee.id);
      extraWhere = ` AND t.assigned_to = $${params.length}`;
    }

    const taskResult = await query(
      `
      SELECT
        t.*,
        p.title AS project_title,
        p.code AS project_code,
        assigned_user.full_name AS assigned_name,
        assigned_user.email AS assigned_email,
        creator.full_name AS assigned_by_name
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN employees ae ON ae.id = t.assigned_to
      LEFT JOIN app_users assigned_user ON assigned_user.id = ae.user_id
      LEFT JOIN app_users creator ON creator.id = t.assigned_by
      WHERE t.id = $1
      ${extraWhere}
      LIMIT 1
      `,
      params
    );

    const task = taskResult.rows[0];

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const [comments, checklists, attachments, activities, timeLogs] =
      await Promise.all([
        query(
          `
          SELECT tc.*, u.full_name
          FROM task_comments tc
          JOIN app_users u ON u.id = tc.user_id
          WHERE tc.task_id = $1
          ORDER BY tc.created_at DESC
          `,
          [task.id]
        ),
        query(
          `
          SELECT *
          FROM task_checklists
          WHERE task_id = $1
          ORDER BY created_at ASC
          `,
          [task.id]
        ),
        query(
          `
          SELECT *
          FROM task_attachments
          WHERE task_id = $1
          ORDER BY created_at DESC
          `,
          [task.id]
        ),
        query(
          `
          SELECT tal.*, u.full_name
          FROM task_activity_logs tal
          LEFT JOIN app_users u ON u.id = tal.user_id
          WHERE tal.task_id = $1
          ORDER BY tal.created_at DESC
          `,
          [task.id]
        ),
        query(
          `
          SELECT ttl.*, u.full_name
          FROM task_time_logs ttl
          JOIN employees e ON e.id = ttl.employee_id
          JOIN app_users u ON u.id = e.user_id
          WHERE ttl.task_id = $1
          ORDER BY ttl.created_at DESC
          `,
          [task.id]
        ),
      ]);

    return res.json({
      task,
      comments: comments.rows,
      checklists: checklists.rows,
      attachments: attachments.rows,
      activities: activities.rows,
      timeLogs: timeLogs.rows,
    });
  } catch (error) {
    console.error("Task detail error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createTask(req, res) {
  try {
    if (!canManageTasks(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const body = req.body;

    const result = await query(
      `
      INSERT INTO tasks (
        project_id,
        title,
        description,
        assigned_to,
        assigned_by,
        status,
        priority,
        start_date,
        due_date,
        estimated_hours,
        actual_hours,
        progress
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
      `,
      [
        body.project_id || null,
        body.title,
        body.description || "",
        body.assigned_to || null,
        req.user.id,
        body.status || "todo",
        body.priority || "medium",
        body.start_date || null,
        body.due_date || null,
        body.estimated_hours || 0,
        body.actual_hours || 0,
        body.progress || 0,
      ]
    );

    await createActivity(
      result.rows[0].id,
      req.user.id,
      "task_created",
      "Task was created."
    );

    return res.status(201).json({
      message: "Task created successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function updateTask(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);
    const body = req.body;

    const currentResult = await query(
      `
      SELECT *
      FROM tasks
      WHERE id=$1
      LIMIT 1
      `,
      [req.params.id]
    );

    const current = currentResult.rows[0];

    if (!current) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isAssignedEmployee = current.assigned_to === employee?.id;

    if (!canManageTasks(req.user.role) && !isAssignedEmployee) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const assignedTo = canManageTasks(req.user.role)
      ? body.assigned_to || null
      : current.assigned_to;

    const title = canManageTasks(req.user.role)
      ? body.title
      : current.title;

    const description = canManageTasks(req.user.role)
      ? body.description || ""
      : current.description;

    const result = await query(
      `
      UPDATE tasks
      SET
        project_id=$1,
        title=$2,
        description=$3,
        assigned_to=$4,
        status=$5,
        priority=$6,
        start_date=$7,
        due_date=$8,
        estimated_hours=$9,
        actual_hours=$10,
        progress=$11,
        updated_at=NOW()
      WHERE id=$12
      RETURNING *
      `,
      [
        canManageTasks(req.user.role) ? body.project_id || null : current.project_id,
        title,
        description,
        assignedTo,
        body.status || current.status,
        canManageTasks(req.user.role) ? body.priority || "medium" : current.priority,
        canManageTasks(req.user.role) ? body.start_date || null : current.start_date,
        canManageTasks(req.user.role) ? body.due_date || null : current.due_date,
        canManageTasks(req.user.role)
          ? body.estimated_hours || 0
          : current.estimated_hours,
        body.actual_hours || current.actual_hours || 0,
        body.progress ?? current.progress ?? 0,
        req.params.id,
      ]
    );

    await createActivity(
      req.params.id,
      req.user.id,
      "task_updated",
      "Task was updated."
    );

    return res.json({
      message: "Task updated successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function deleteTask(req, res) {
  try {
    if (!canManageTasks(req.user.role)) {
      return res.status(403).json({ message: "Only admin or manager can delete tasks" });
    }

    const result = await query(
      `
      DELETE FROM tasks
      WHERE id=$1
      RETURNING id
      `,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateTaskStatus(req, res) {
  try {
    const { status } = req.body;

    const result = await query(
      `
      UPDATE tasks
      SET status=$1,
          progress = CASE
            WHEN $1='todo' THEN 0
            WHEN $1='in_progress' THEN GREATEST(progress, 25)
            WHEN $1='review' THEN GREATEST(progress, 60)
            WHEN $1='testing' THEN GREATEST(progress, 80)
            WHEN $1='completed' THEN 100
            ELSE progress
          END,
          updated_at=NOW()
      WHERE id=$2
      RETURNING *
      `,
      [status, req.params.id]
    );

    await createActivity(
      req.params.id,
      req.user.id,
      "status_updated",
      `Task status changed to ${status}.`
    );

    return res.json({
      message: "Status updated",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Status update error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateTaskProgress(req, res) {
  try {
    const { progress } = req.body;

    const result = await query(
      `
      UPDATE tasks
      SET progress=$1,
          updated_at=NOW()
      WHERE id=$2
      RETURNING *
      `,
      [progress, req.params.id]
    );

    await createActivity(
      req.params.id,
      req.user.id,
      "progress_updated",
      `Task progress changed to ${progress}%.`
    );

    return res.json({
      message: "Progress updated",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Progress update error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function addTaskComment(req, res) {
  try {
    const { comment } = req.body;

    const result = await query(
      `
      INSERT INTO task_comments
      (task_id, user_id, comment)
      VALUES ($1,$2,$3)
      RETURNING *
      `,
      [req.params.id, req.user.id, comment]
    );

    await createActivity(
      req.params.id,
      req.user.id,
      "comment_added",
      "Comment added to task."
    );

    return res.status(201).json({
      message: "Comment added",
      comment: result.rows[0],
    });
  } catch (error) {
    console.error("Add comment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteTaskComment(req, res) {
  try {
    await query(
      `
      DELETE FROM task_comments
      WHERE id=$1
      AND (
        user_id=$2
        OR $3 IN ('admin','manager')
      )
      `,
      [req.params.commentId, req.user.id, req.user.role]
    );

    return res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function addChecklistItem(req, res) {
  try {
    const { title } = req.body;

    const result = await query(
      `
      INSERT INTO task_checklists
      (task_id, title, is_done)
      VALUES ($1,$2,false)
      RETURNING *
      `,
      [req.params.id, title]
    );

    return res.status(201).json({
      message: "Checklist item added",
      item: result.rows[0],
    });
  } catch (error) {
    console.error("Add checklist error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateChecklistItem(req, res) {
  try {
    const { title, is_done } = req.body;

    const result = await query(
      `
      UPDATE task_checklists
      SET title = COALESCE($1, title),
          is_done = COALESCE($2, is_done),
          updated_at=NOW()
      WHERE id=$3
      RETURNING *
      `,
      [title || null, is_done, req.params.checklistId]
    );

    return res.json({
      message: "Checklist updated",
      item: result.rows[0],
    });
  } catch (error) {
    console.error("Update checklist error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteChecklistItem(req, res) {
  try {
    await query(`DELETE FROM task_checklists WHERE id=$1`, [
      req.params.checklistId,
    ]);

    return res.json({ message: "Checklist item deleted" });
  } catch (error) {
    console.error("Delete checklist error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function startTaskTimer(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    const active = await query(
      `
      SELECT *
      FROM task_time_logs
      WHERE task_id=$1
      AND employee_id=$2
      AND end_time IS NULL
      LIMIT 1
      `,
      [req.params.id, employee.id]
    );

    if (active.rows.length) {
      return res.status(400).json({ message: "Timer already running" });
    }

    const result = await query(
      `
      INSERT INTO task_time_logs
      (task_id, employee_id, start_time)
      VALUES ($1,$2,NOW())
      RETURNING *
      `,
      [req.params.id, employee.id]
    );

    return res.status(201).json({
      message: "Timer started",
      timeLog: result.rows[0],
    });
  } catch (error) {
    console.error("Start timer error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function stopTaskTimer(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    const result = await query(
      `
      UPDATE task_time_logs
      SET
        end_time=NOW(),
        minutes=GREATEST(1, FLOOR(EXTRACT(EPOCH FROM (NOW() - start_time)) / 60))
      WHERE task_id=$1
      AND employee_id=$2
      AND end_time IS NULL
      RETURNING *
      `,
      [req.params.id, employee.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "No active timer found" });
    }

    await query(
      `
      UPDATE tasks
      SET actual_hours = actual_hours + ($1::numeric / 60),
          updated_at=NOW()
      WHERE id=$2
      `,
      [result.rows[0].minutes, req.params.id]
    );

    return res.json({
      message: "Timer stopped",
      timeLog: result.rows[0],
    });
  } catch (error) {
    console.error("Stop timer error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}