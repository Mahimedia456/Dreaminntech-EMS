export default function TaskBuilderPage() {
  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Task Builder</h1>
          <p>
            Create tasks, assign employees and
            manage deadlines.
          </p>
        </div>
      </div>

      <form className="employee-form-layout">
        <div className="dashboard-card">
          <h2>Task Information</h2>

          <div className="employee-form-grid">
            <div>
              <label>Task Title</label>
              <input />
            </div>

            <div>
              <label>Project</label>
              <select>
                <option>Employee Management System</option>
              </select>
            </div>

            <div>
              <label>Assigned To</label>
              <select>
                <option>Aamir Ali</option>
              </select>
            </div>

            <div>
              <label>Priority</label>
              <select>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div>
              <label>Status</label>
              <select>
                <option>To Do</option>
                <option>In Progress</option>
                <option>Review</option>
                <option>Completed</option>
              </select>
            </div>

            <div>
              <label>Due Date</label>
              <input type="date" />
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>Description</label>

            <textarea
              className="task-description"
              placeholder="Task details..."
            />
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Checklist</h2>

          <div className="checklist-list">
            <div>
              <input type="checkbox" />
              <span>Create UI</span>
            </div>

            <div>
              <input type="checkbox" />
              <span>Connect API</span>
            </div>

            <div>
              <input type="checkbox" />
              <span>Testing</span>
            </div>
          </div>
        </div>

        <div className="employee-submit-wrap">
          <button
            type="submit"
            className="login-btn"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
}