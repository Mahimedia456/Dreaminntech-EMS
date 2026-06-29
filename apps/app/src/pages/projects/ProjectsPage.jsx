import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, FolderKanban, Plus, Trash2, Users } from "lucide-react";
import { deleteProject, fetchProjects } from "../../services/projectsApi";
import { getAuthUser } from "../../utils/auth";

export default function ProjectsPage() {
  const user = getAuthUser();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user.role === "admin";

  async function loadProjects() {
    try {
      setLoading(true);
      const data = await fetchProjects();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this project?")) return;

    try {
      await deleteProject(id);
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const active = projects.filter((p) => p.status === "active").length;
  const completed = projects.filter((p) => p.status === "completed").length;
  const tasks = projects.reduce((s, p) => s + Number(p.tasks_count || 0), 0);

  return (
    <div>
      <div className="dashboard-header employees-header">
        <div>
          <h1>Projects</h1>
          <p>
            {isAdmin
              ? "Manage company projects, members and progress."
              : "View your assigned projects and tasks."}
          </p>
        </div>

        {isAdmin && (
          <Link to="/projects/create" className="employee-add-btn">
            <Plus size={18} />
            Create Project
          </Link>
        )}
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="stats-grid">
        <ProjectStat title="Total Projects" value={projects.length} icon={FolderKanban} />
        <ProjectStat title="Active Projects" value={active} icon={FolderKanban} />
        <ProjectStat title="Completed" value={completed} icon={CheckSquare} />
        <ProjectStat title="Total Tasks" value={tasks} icon={Users} />
      </div>

      <div className="project-grid">
        {loading ? (
          <div className="dashboard-card">Loading projects...</div>
        ) : (
          projects.map((project) => (
            <div className="project-card" key={project.id}>
              <div className="project-card-head">
                <h3>{project.title}</h3>
                <span>{project.priority}</span>
              </div>

              <p>{project.description || "No description"}</p>

              <div className="project-info">
                <div>
                  <span>Status</span>
                  <strong>{project.status}</strong>
                </div>

                <div>
                  <span>Manager</span>
                  <strong>{project.manager_name || "-"}</strong>
                </div>
              </div>

              <div className="project-progress">
                <div style={{ width: `${project.progress || 0}%` }} />
              </div>

              <div className="project-actions">
                <Link to={`/projects/${project.id}`}>
                  <button>View</button>
                </Link>

                {isAdmin && (
                  <>
                    <Link to={`/projects/${project.id}/edit`}>
                      <button>Edit</button>
                    </Link>

                    <button className="danger" onClick={() => handleDelete(project.id)}>
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ProjectStat({ title, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <div>
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
}