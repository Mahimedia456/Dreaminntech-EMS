import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CalendarDays,
  CheckSquare,
  Clock3,
  FolderKanban,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import { getAuthUser } from "../../utils/auth";
import {
  addProjectMember,
  createProjectTask,
  deleteProjectTask,
  fetchProjectDetail,
  removeProjectMember,
  updateProjectTask,
} from "../../services/projectsApi";

import { fetchEmployees } from "../../services/employeesApi";

const tabs = ["Overview", "Members", "Tasks", "Milestones", "Activity"];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const user = getAuthUser();

  const [activeTab, setActiveTab] = useState("Overview");
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [memberForm, setMemberForm] = useState({
    employee_id: "",
    role: "member",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    status: "todo",
    priority: "medium",
    start_date: "",
    due_date: "",
    estimated_hours: 0,
  });

  const [editingTask, setEditingTask] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";
  const canManage = isAdmin || isManager;

  async function loadProject() {
    try {
      setLoading(true);
      setError("");

      const [projectRes, employeesRes] = await Promise.all([
        fetchProjectDetail(id),
        fetchEmployees(),
      ]);

      setProject(projectRes.project);
      setMembers(projectRes.members || []);
      setMilestones(projectRes.milestones || []);
      setTasks(projectRes.tasks || []);
      setEmployees(employeesRes.employees || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();

    try {
      setError("");

      await addProjectMember(id, memberForm);

      setMemberForm({
        employee_id: "",
        role: "member",
      });

      loadProject();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveMember(memberId) {
    if (!window.confirm("Remove this member?")) return;

    try {
      await removeProjectMember(id, memberId);
      loadProject();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleTaskSubmit(e) {
    e.preventDefault();

    try {
      setError("");

      if (editingTask) {
        await updateProjectTask(id, editingTask.id, taskForm);
      } else {
        await createProjectTask(id, taskForm);
      }

      setTaskForm({
        title: "",
        description: "",
        assigned_to: "",
        status: "todo",
        priority: "medium",
        start_date: "",
        due_date: "",
        estimated_hours: 0,
      });

      setEditingTask(null);
      loadProject();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEditTask(task) {
    setEditingTask(task);

    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      assigned_to: task.assigned_to || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      start_date: task.start_date || "",
      due_date: task.due_date || "",
      estimated_hours: task.estimated_hours || 0,
      actual_hours: task.actual_hours || 0,
    });

    setActiveTab("Tasks");
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm("Delete this task?")) return;

    try {
      await deleteProjectTask(id, taskId);
      loadProject();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProject();
  }, [id]);

  if (loading) {
    return <div className="dashboard-card">Loading project...</div>;
  }

  if (!project) {
    return <div className="dashboard-card">Project not found.</div>;
  }

  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const totalEstimated = tasks.reduce(
    (sum, task) => sum + Number(task.estimated_hours || 0),
    0
  );

  const totalActual = tasks.reduce(
    (sum, task) => sum + Number(task.actual_hours || 0),
    0
  );

  return (
    <div>
      <div className="project-detail-header">
        <div>
          <div className="project-breadcrumb">
            <Link to="/projects">Projects</Link>
            <span>/</span>
            <strong>{project.title}</strong>
          </div>

          <h1>{project.title}</h1>

          <p>{project.description || "No description added."}</p>

          <div className="employee-detail-badges">
            <span>{project.code || "-"}</span>
            <span>{project.status}</span>
            <span>{project.priority}</span>
            <span>{project.progress || 0}%</span>
          </div>
        </div>

        {isAdmin && (
          <Link to={`/projects/${project.id}/edit`} className="employee-add-btn">
            <Pencil size={18} />
            Edit Project
          </Link>
        )}
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="project-progress project-progress-large">
        <div style={{ width: `${project.progress || 0}%` }} />
      </div>

      <div className="stats-grid">
        <ProjectStat title="Members" value={members.length} icon={Users} />
        <ProjectStat title="Tasks" value={tasks.length} icon={CheckSquare} />
        <ProjectStat title="Completed Tasks" value={completedTasks} icon={FolderKanban} />
        <ProjectStat title="Estimated Hours" value={totalEstimated} icon={Clock3} />
      </div>

      <div className="employee-detail-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <OverviewTab
          project={project}
          tasks={tasks}
          members={members}
          totalEstimated={totalEstimated}
          totalActual={totalActual}
        />
      )}

      {activeTab === "Members" && (
        <MembersTab
          members={members}
          employees={employees}
          canManage={canManage}
          memberForm={memberForm}
          setMemberForm={setMemberForm}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
      )}

      {activeTab === "Tasks" && (
        <TasksTab
          tasks={tasks}
          employees={employees}
          canManage={canManage}
          taskForm={taskForm}
          setTaskForm={setTaskForm}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          onTaskSubmit={handleTaskSubmit}
          onEditTask={startEditTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {activeTab === "Milestones" && (
        <MilestonesTab milestones={milestones} />
      )}

      {activeTab === "Activity" && (
        <ActivityTab project={project} tasks={tasks} members={members} />
      )}
    </div>
  );
}

function OverviewTab({ project, tasks, members, totalEstimated, totalActual }) {
  return (
    <div className="payroll-grid">
      <div className="dashboard-card">
        <h2>Project Information</h2>

        <div className="profile-info">
          <Info label="Client" value={project.client_name || "-"} />
          <Info label="Manager" value={project.manager_name || "-"} />
          <Info label="Start Date" value={project.start_date || "-"} />
          <Info label="Due Date" value={project.due_date || "-"} />
          <Info label="Budget" value={`Rs ${Number(project.budget || 0).toLocaleString()}`} />
          <Info label="Progress" value={`${project.progress || 0}%`} />
        </div>
      </div>

      <div className="dashboard-card">
        <h2>Project Summary</h2>

        <div className="profile-info">
          <Info label="Total Members" value={members.length} />
          <Info label="Total Tasks" value={tasks.length} />
          <Info
            label="Completed Tasks"
            value={tasks.filter((task) => task.status === "completed").length}
          />
          <Info label="Estimated Hours" value={totalEstimated} />
          <Info label="Actual Hours" value={totalActual} />
          <Info
            label="Pending Tasks"
            value={tasks.filter((task) => task.status !== "completed").length}
          />
        </div>
      </div>
    </div>
  );
}

function MembersTab({
  members,
  employees,
  canManage,
  memberForm,
  setMemberForm,
  onAddMember,
  onRemoveMember,
}) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-header employees-header" style={{ padding: 0 }}>
        <div>
          <h2>Project Members</h2>
          <p>Assigned team members and project roles.</p>
        </div>
      </div>

      {canManage && (
        <form className="project-inline-form" onSubmit={onAddMember}>
          <select
            value={memberForm.employee_id}
            required
            onChange={(e) =>
              setMemberForm((prev) => ({
                ...prev,
                employee_id: e.target.value,
              }))
            }
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.role})
              </option>
            ))}
          </select>

          <select
            value={memberForm.role}
            onChange={(e) =>
              setMemberForm((prev) => ({
                ...prev,
                role: e.target.value,
              }))
            }
          >
            <option value="member">Member</option>
            <option value="manager">Manager</option>
            <option value="viewer">Viewer</option>
          </select>

          <button className="employee-add-btn" type="submit">
            <Plus size={16} />
            Add Member
          </button>
        </form>
      )}

      <div className="employee-table" style={{ marginTop: 18 }}>
        <div className="department-row department-row-head">
          <span>Member</span>
          <span>Email</span>
          <span>Department</span>
          <span>Role</span>
          <span>Actions</span>
        </div>

        {members.map((member) => (
          <div className="department-row" key={member.id}>
            <span>{member.full_name}</span>
            <span>{member.email}</span>
            <span>{member.department || "-"}</span>
            <span>{member.role}</span>

            <div className="employee-actions">
              {canManage ? (
                <button className="danger" onClick={() => onRemoveMember(member.id)}>
                  Remove
                </button>
              ) : (
                <span>View Only</span>
              )}
            </div>
          </div>
        ))}

        {!members.length && (
          <div className="department-row">
            <span>No members found</span>
            <span>-</span>
            <span>-</span>
            <span>-</span>
            <span>-</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TasksTab({
  tasks,
  employees,
  canManage,
  taskForm,
  setTaskForm,
  editingTask,
  setEditingTask,
  onTaskSubmit,
  onEditTask,
  onDeleteTask,
}) {
  return (
    <div>
      {canManage && (
        <div className="dashboard-card">
          <h2>{editingTask ? "Edit Task" : "Create Task"}</h2>

          <form className="employee-form-grid" onSubmit={onTaskSubmit}>
            <div>
              <label>Task Title</label>
              <input
                required
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label>Assign To</label>
              <select
                value={taskForm.assigned_to}
                onChange={(e) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    assigned_to: e.target.value,
                  }))
                }
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Status</label>
              <select
                value={taskForm.status}
                onChange={(e) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="testing">Testing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label>Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }))
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label>Start Date</label>
              <input
                type="date"
                value={taskForm.start_date}
                onChange={(e) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label>Due Date</label>
              <input
                type="date"
                value={taskForm.due_date}
                onChange={(e) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    due_date: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label>Estimated Hours</label>
              <input
                type="number"
                value={taskForm.estimated_hours}
                onChange={(e) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    estimated_hours: e.target.value,
                  }))
                }
              />
            </div>

            {editingTask && (
              <div>
                <label>Actual Hours</label>
                <input
                  type="number"
                  value={taskForm.actual_hours || 0}
                  onChange={(e) =>
                    setTaskForm((prev) => ({
                      ...prev,
                      actual_hours: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            <div style={{ gridColumn: "1 / -1" }}>
              <label>Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="employee-submit-wrap" style={{ gridColumn: "1 / -1" }}>
              <button className="login-btn" type="submit">
                {editingTask ? "Update Task" : "Create Task"}
              </button>

              {editingTask && (
                <button
                  className="secondary-btn"
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setTaskForm({
                      title: "",
                      description: "",
                      assigned_to: "",
                      status: "todo",
                      priority: "medium",
                      start_date: "",
                      due_date: "",
                      estimated_hours: 0,
                    });
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-card">
        <h2>Project Tasks</h2>

        <div className="employee-table">
          <div className="department-row department-row-head">
            <span>Task</span>
            <span>Assigned</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Actions</span>
          </div>

          {tasks.map((task) => (
            <div className="department-row" key={task.id}>
              <span>{task.title}</span>
              <span>{task.assigned_name || "-"}</span>
              <span>{task.status}</span>
              <span>{task.priority}</span>

              <div className="employee-actions">
                {canManage ? (
                  <>
                    <button onClick={() => onEditTask(task)}>Edit</button>
                    <button className="danger" onClick={() => onDeleteTask(task.id)}>
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <span>View Only</span>
                )}
              </div>
            </div>
          ))}

          {!tasks.length && (
            <div className="department-row">
              <span>No tasks found</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MilestonesTab({ milestones }) {
  return (
    <div className="dashboard-card">
      <h2>Milestones</h2>

      <div className="dashboard-list">
        {milestones.map((milestone) => (
          <div key={milestone.id}>
            <strong>{milestone.title}</strong>
            <span>
              {milestone.status} • Due {milestone.due_date || "-"}
            </span>
          </div>
        ))}

        {!milestones.length && (
          <div>
            <strong>No milestones found</strong>
            <span>-</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityTab({ project, tasks, members }) {
  return (
    <div className="dashboard-card">
      <h2>Activity</h2>

      <div className="dashboard-list">
        <div>
          <strong>Project created</strong>
          <span>{project.created_at?.slice(0, 10)}</span>
        </div>

        <div>
          <strong>{members.length} members assigned</strong>
          <span>Team updated</span>
        </div>

        <div>
          <strong>{tasks.length} tasks available</strong>
          <span>Task board updated</span>
        </div>
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

function Info({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
