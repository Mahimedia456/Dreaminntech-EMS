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

export async function getProjects(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);

    const params = [];
    let where = "WHERE 1=1";

    if (req.user.role !== "admin") {
      params.push(employee.id);
      where += ` AND (
        p.manager_id = $${params.length}
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id
          AND pm.employee_id = $${params.length}
        )
      )`;
    }

    const result = await query(
      `
      SELECT
        p.*,
        u.full_name AS manager_name,
        COUNT(DISTINCT pm.id)::int AS members_count,
        COUNT(DISTINCT pt.id)::int AS tasks_count,
        COUNT(DISTINCT pt.id) FILTER (WHERE pt.status='completed')::int AS completed_tasks
      FROM projects p
      LEFT JOIN employees me ON me.id = p.manager_id
      LEFT JOIN app_users u ON u.id = me.user_id
      LEFT JOIN project_members pm ON pm.project_id = p.id
      LEFT JOIN project_tasks pt ON pt.project_id = p.id
      ${where}
      GROUP BY p.id, u.full_name
      ORDER BY p.created_at DESC
      `,
      params
    );

    return res.json({ projects: result.rows });
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getProjectDetail(req, res) {
  try {
    const employee = await getEmployeeByUser(req.user.id);
    const params = [req.params.id];

    let accessWhere = "";

    if (req.user.role !== "admin") {
      params.push(employee.id);
      accessWhere = `
      AND (
        p.manager_id = $2
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id
          AND pm.employee_id = $2
        )
      )
      `;
    }

    const projectResult = await query(
      `
      SELECT
        p.*,
        u.full_name AS manager_name
      FROM projects p
      LEFT JOIN employees me ON me.id = p.manager_id
      LEFT JOIN app_users u ON u.id = me.user_id
      WHERE p.id = $1
      ${accessWhere}
      LIMIT 1
      `,
      params
    );

    const project = projectResult.rows[0];

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const members = await query(
      `
      SELECT
        pm.*,
        u.full_name,
        u.email,
        e.employee_code,
        d.name AS department
      FROM project_members pm
      JOIN employees e ON e.id = pm.employee_id
      JOIN app_users u ON u.id = e.user_id
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE pm.project_id = $1
      ORDER BY u.full_name ASC
      `,
      [project.id]
    );

    const milestones = await query(
      `
      SELECT *
      FROM project_milestones
      WHERE project_id = $1
      ORDER BY due_date ASC
      `,
      [project.id]
    );

    const tasks = await query(
      `
      SELECT
        pt.*,
        u.full_name AS assigned_name
      FROM project_tasks pt
      LEFT JOIN employees e ON e.id = pt.assigned_to
      LEFT JOIN app_users u ON u.id = e.user_id
      WHERE pt.project_id = $1
      ORDER BY pt.created_at DESC
      `,
      [project.id]
    );

    return res.json({
      project,
      members: members.rows,
      milestones: milestones.rows,
      tasks: tasks.rows,
    });
  } catch (error) {
    console.error("Get project detail error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createProject(req, res) {
  try {
    const body = req.body;

    const result = await query(
      `
      INSERT INTO projects (
        title,
        code,
        description,
        client_name,
        start_date,
        due_date,
        status,
        priority,
        progress,
        budget,
        manager_id,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
      `,
      [
        body.title,
        body.code || `PRJ-${Date.now()}`,
        body.description || "",
        body.client_name || "",
        body.start_date || null,
        body.due_date || null,
        body.status || "planning",
        body.priority || "medium",
        body.progress || 0,
        body.budget || 0,
        body.manager_id || null,
        req.user.id,
      ]
    );

    return res.status(201).json({
      message: "Project created successfully",
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function updateProject(req, res) {
  try {
    const body = req.body;

    const result = await query(
      `
      UPDATE projects
      SET
        title=$1,
        code=$2,
        description=$3,
        client_name=$4,
        start_date=$5,
        due_date=$6,
        status=$7,
        priority=$8,
        progress=$9,
        budget=$10,
        manager_id=$11,
        updated_at=NOW()
      WHERE id=$12
      RETURNING *
      `,
      [
        body.title,
        body.code,
        body.description || "",
        body.client_name || "",
        body.start_date || null,
        body.due_date || null,
        body.status || "planning",
        body.priority || "medium",
        body.progress || 0,
        body.budget || 0,
        body.manager_id || null,
        req.params.id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json({
      message: "Project updated successfully",
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function deleteProject(req, res) {
  try {
    await query(`DELETE FROM projects WHERE id=$1`, [req.params.id]);

    return res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function addProjectMember(req, res) {
  try {
    const { employee_id, role } = req.body;

    const result = await query(
      `
      INSERT INTO project_members (project_id, employee_id, role)
      VALUES ($1,$2,$3)
      ON CONFLICT (project_id, employee_id)
      DO UPDATE SET role = EXCLUDED.role
      RETURNING *
      `,
      [req.params.id, employee_id, role || "member"]
    );

    return res.status(201).json({
      message: "Member added",
      member: result.rows[0],
    });
  } catch (error) {
    console.error("Add member error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function removeProjectMember(req, res) {
  try {
    await query(`DELETE FROM project_members WHERE id=$1`, [req.params.memberId]);

    return res.json({ message: "Member removed" });
  } catch (error) {
    console.error("Remove member error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createProjectTask(req, res) {
  try {
    const body = req.body;

    const result = await query(
      `
      INSERT INTO project_tasks (
        project_id,
        milestone_id,
        title,
        description,
        assigned_to,
        created_by,
        status,
        priority,
        start_date,
        due_date,
        estimated_hours
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
      [
        req.params.id,
        body.milestone_id || null,
        body.title,
        body.description || "",
        body.assigned_to || null,
        req.user.id,
        body.status || "todo",
        body.priority || "medium",
        body.start_date || null,
        body.due_date || null,
        body.estimated_hours || 0,
      ]
    );

    return res.status(201).json({
      message: "Task created",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function updateProjectTask(req, res) {
  try {
    const body = req.body;

    const result = await query(
      `
      UPDATE project_tasks
      SET
        title=$1,
        description=$2,
        assigned_to=$3,
        status=$4,
        priority=$5,
        start_date=$6,
        due_date=$7,
        estimated_hours=$8,
        actual_hours=$9,
        updated_at=NOW()
      WHERE id=$10
      RETURNING *
      `,
      [
        body.title,
        body.description || "",
        body.assigned_to || null,
        body.status || "todo",
        body.priority || "medium",
        body.start_date || null,
        body.due_date || null,
        body.estimated_hours || 0,
        body.actual_hours || 0,
        req.params.taskId,
      ]
    );

    return res.json({
      message: "Task updated",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function deleteProjectTask(req, res) {
  try {
    await query(`DELETE FROM project_tasks WHERE id=$1`, [req.params.taskId]);

    return res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}