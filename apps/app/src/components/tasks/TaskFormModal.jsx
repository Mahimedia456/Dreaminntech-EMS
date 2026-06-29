import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { fetchEmployees } from "../../services/employeesApi";
import { fetchProjects } from "../../services/projectsApi";

const initialForm = {
  project_id: "",
  title: "",
  description: "",
  assigned_to: "",
  status: "todo",
  priority: "medium",
  start_date: "",
  due_date: "",
  estimated_hours: 0,
  actual_hours: 0,
  progress: 0,
};

function cleanDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export default function TaskFormModal({ open, selected, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  async function loadMeta() {
    const [employeesRes, projectsRes] = await Promise.all([
      fetchEmployees(),
      fetchProjects(),
    ]);

    setEmployees(employeesRes.employees || []);
    setProjects(projectsRes.projects || []);
  }

  useEffect(() => {
    if (open) loadMeta();
  }, [open]);

  useEffect(() => {
    if (selected) {
      setForm({
        project_id: selected.project_id || "",
        title: selected.title || "",
        description: selected.description || "",
        assigned_to: selected.assigned_to || "",
        status: selected.status || "todo",
        priority: selected.priority || "medium",
        start_date: cleanDate(selected.start_date),
        due_date: cleanDate(selected.due_date),
        estimated_hours: selected.estimated_hours || 0,
        actual_hours: selected.actual_hours || 0,
        progress: selected.progress || 0,
      });
    } else {
      setForm(initialForm);
    }
  }, [selected, open]);

  if (!open) return null;

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="modal-overlay">
      <form className="checkout-modal" onSubmit={handleSubmit}>
        <div className="checkout-header">
          <div>
            <h2>{selected ? "Edit Task" : "Create Task"}</h2>
            <p>Assign task, priority, progress and due date.</p>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="checkout-body">
          <div className="employee-form-grid">
            <div>
              <label>Task Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>

            <div>
              <label>Project</label>
              <select
                value={form.project_id}
                onChange={(e) => updateField("project_id", e.target.value)}
              >
                <option value="">No Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Assign To</label>
              <select
                value={form.assigned_to}
                onChange={(e) => updateField("assigned_to", e.target.value)}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="testing">Testing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => updateField("priority", e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label>Progress %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.progress}
                onChange={(e) => updateField("progress", e.target.value)}
              />
            </div>

            <div>
              <label>Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => updateField("start_date", e.target.value)}
              />
            </div>

            <div>
              <label>Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => updateField("due_date", e.target.value)}
              />
            </div>

            <div>
              <label>Estimated Hours</label>
              <input
                type="number"
                value={form.estimated_hours}
                onChange={(e) => updateField("estimated_hours", e.target.value)}
              />
            </div>

            <div>
              <label>Actual Hours</label>
              <input
                type="number"
                value={form.actual_hours}
                onChange={(e) => updateField("actual_hours", e.target.value)}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="checkout-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="login-btn">
            {selected ? "Update Task" : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}