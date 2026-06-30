import React, { useEffect, useState } from "react";
import { fetchEmployees } from "../../services/employeesApi";

const initialForm = {
  title: "",
  code: "",
  description: "",
  client_name: "",
  start_date: "",
  due_date: "",
  status: "planning",
  priority: "medium",
  progress: 0,
  budget: 0,
  manager_id: "",
};

export default function ProjectForm({ initialValues, onSubmit, loading }) {
  const [form, setForm] = useState(initialForm);
  const [employees, setEmployees] = useState([]);

  async function loadEmployees() {
    const data = await fetchEmployees();
    setEmployees(data.employees || []);
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || "",
        code: initialValues.code || "",
        description: initialValues.description || "",
        client_name: initialValues.client_name || "",
        start_date: initialValues.start_date || "",
        due_date: initialValues.due_date || "",
        status: initialValues.status || "planning",
        priority: initialValues.priority || "medium",
        progress: initialValues.progress || 0,
        budget: initialValues.budget || 0,
        manager_id: initialValues.manager_id || "",
      });
    }
  }, [initialValues]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="employee-form-layout" onSubmit={handleSubmit}>
      <div className="dashboard-card">
        <h2>Project Information</h2>

        <div className="employee-form-grid">
          <div>
            <label>Project Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>

          <div>
            <label>Project Code</label>
            <input
              value={form.code}
              placeholder="PRJ-001"
              onChange={(e) => updateField("code", e.target.value)}
            />
          </div>

          <div>
            <label>Client Name</label>
            <input
              value={form.client_name}
              onChange={(e) => updateField("client_name", e.target.value)}
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
            <label>Manager</label>
            <select
              value={form.manager_id}
              onChange={(e) => updateField("manager_id", e.target.value)}
            >
              <option value="">Select Manager</option>
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
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
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
            <label>Budget</label>
            <input
              type="number"
              value={form.budget}
              onChange={(e) => updateField("budget", e.target.value)}
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

      <div className="employee-submit-wrap">
        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Project"}
        </button>
      </div>
    </form>
  );
}
