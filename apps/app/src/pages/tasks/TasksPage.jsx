import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckSquare,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { getAuthUser } from "../../utils/auth";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from "../../services/tasksApi";

import TaskFormModal from "../../components/tasks/TaskFormModal";
import TaskViewModal from "../../components/tasks/TaskViewModal";

const statusColumns = [
  { key: "todo", label: "Todo" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "testing", label: "Testing" },
  { key: "completed", label: "Completed" },
];

function formatDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 10);
}

export default function TasksPage() {
  const user = getAuthUser();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  const [formOpen, setFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewTask, setViewTask] = useState(null);

  const [error, setError] = useState("");

  const canManage = user.role === "admin" || user.role === "manager";

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchTasks();

      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setSelectedTask(null);
    setFormOpen(true);
  }

  function openEdit(task) {
    setSelectedTask(task);
    setFormOpen(true);
  }

  async function handleSubmit(payload) {
    try {
      setError("");

      if (selectedTask) {
        await updateTask(selectedTask.id, payload);
      } else {
        await createTask(payload);
      }

      setFormOpen(false);
      setSelectedTask(null);
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this task?")) return;

    try {
      setError("");
      await deleteTask(id);
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        task.title?.toLowerCase().includes(keyword) ||
        task.description?.toLowerCase().includes(keyword) ||
        task.project_title?.toLowerCase().includes(keyword) ||
        task.assigned_name?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status !== "completed").length,
    urgent: tasks.filter((t) => t.priority === "urgent").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  return (
    <div>
      <div className="dashboard-header employees-header">
        <div>
          <h1>Tasks Management</h1>
          <p>
            {canManage
              ? "Create, assign, track and manage company tasks."
              : "View and update your assigned tasks."}
          </p>
        </div>

        {canManage && (
          <button className="employee-add-btn" onClick={openCreate}>
            <Plus size={18} />
            Create Task
          </button>
        )}
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="stats-grid">
        <TaskStat title="Total Tasks" value={stats.total} icon={CheckSquare} />
        <TaskStat title="Pending Tasks" value={stats.pending} icon={Users} />
        <TaskStat title="Urgent Tasks" value={stats.urgent} icon={AlertTriangle} />
        <TaskStat title="Completed" value={stats.completed} icon={CheckSquare} />
      </div>

      <div className="dashboard-card">
        <div className="task-toolbar">
          <div className="salary-search">
            <Search size={18} />
            <input
              placeholder="Search task, project, employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="testing">Testing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
            <option value="list">List View</option>
            <option value="kanban">Kanban View</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading tasks...</p>
        ) : viewMode === "list" ? (
          <TaskList
            tasks={filteredTasks}
            canManage={canManage}
            onView={setViewTask}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ) : (
          <TaskKanban
            tasks={filteredTasks}
            canManage={canManage}
            onView={setViewTask}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <TaskFormModal
        open={formOpen}
        selected={selectedTask}
        onClose={() => {
          setFormOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleSubmit}
      />

      <TaskViewModal
        open={Boolean(viewTask)}
        task={viewTask}
        onClose={() => setViewTask(null)}
        onUpdated={loadTasks}
      />
    </div>
  );
}

function TaskList({ tasks, canManage, onView, onEdit, onDelete }) {
  return (
    <div className="employee-table">
      <div className="department-row department-row-head task-table-head">
        <span>Task</span>
        <span>Project</span>
        <span>Assigned To</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Due Date</span>
        <span>Actions</span>
      </div>

      {tasks.map((task) => (
        <div className="department-row task-table-row" key={task.id}>
          <span>
            <strong>{task.title}</strong>
            <small>{task.progress || 0}% complete</small>
          </span>

          <span>{task.project_title || "-"}</span>
          <span>{task.assigned_name || "-"}</span>
          <span>{task.status}</span>
          <span>{task.priority}</span>
          <span>{formatDate(task.due_date)}</span>

          <div className="employee-actions">
            <button onClick={() => onView(task)} title="View">
              <Eye size={14} />
            </button>

            {canManage && (
              <>
                <button onClick={() => onEdit(task)} title="Edit">
                  <Pencil size={14} />
                </button>

                <button
                  className="danger"
                  onClick={() => onDelete(task.id)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </>
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
          <span>-</span>
          <span>-</span>
        </div>
      )}
    </div>
  );
}

function TaskKanban({ tasks, canManage, onView, onEdit, onDelete }) {
  return (
    <div className="task-kanban-grid">
      {statusColumns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.key);

        return (
          <div className="task-kanban-column" key={column.key}>
            <div className="task-kanban-head">
              <h3>{column.label}</h3>
              <span>{columnTasks.length}</span>
            </div>

            <div className="task-kanban-list">
              {columnTasks.map((task) => (
                <div className="task-kanban-card" key={task.id}>
                  <div className="task-kanban-card-head">
                    <strong>{task.title}</strong>
                    <span>{task.priority}</span>
                  </div>

                  <p>{task.description || "No description"}</p>

                  <div className="project-progress">
                    <div style={{ width: `${task.progress || 0}%` }} />
                  </div>

                  <div className="task-kanban-meta">
                    <span>{task.assigned_name || "Unassigned"}</span>
                    <span>{formatDate(task.due_date)}</span>
                  </div>

                  <div className="employee-actions">
                    <button onClick={() => onView(task)}>
                      <Eye size={14} />
                    </button>

                    {canManage && (
                      <>
                        <button onClick={() => onEdit(task)}>
                          <Pencil size={14} />
                        </button>

                        <button
                          className="danger"
                          onClick={() => onDelete(task.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {!columnTasks.length && (
                <div className="task-empty-box">No tasks</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskStat({ title, value, icon: Icon }) {
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