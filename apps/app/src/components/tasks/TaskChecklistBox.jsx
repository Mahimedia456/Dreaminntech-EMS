import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  addChecklistItem,
  deleteChecklistItem,
  updateChecklistItem,
} from "../../services/tasksApi";

export default function TaskChecklistBox({ taskId, items = [], onUpdated }) {
  const [title, setTitle] = useState("");
  const [loadingId, setLoadingId] = useState("");
  const [error, setError] = useState("");

  async function handleAdd(e) {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      setError("");
      await addChecklistItem(taskId, { title });
      setTitle("");
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(item) {
    try {
      setLoadingId(item.id);
      setError("");

      await updateChecklistItem(item.id, {
        title: item.title,
        is_done: !item.is_done,
      });

      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId("");
    }
  }

  async function handleDelete(id) {
    try {
      setLoadingId(id);
      setError("");

      await deleteChecklistItem(id);

      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId("");
    }
  }

  const doneCount = items.filter((item) => item.is_done).length;
  const percent = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <div className="dashboard-card">
      <h2>Checklist</h2>

      {error && <div className="auth-error">{error}</div>}

      <div className="task-checklist-progress">
        <div>
          <span>
            {doneCount}/{items.length} completed
          </span>
          <strong>{percent}%</strong>
        </div>

        <div className="project-progress">
          <div style={{ width: `${percent}%` }} />
        </div>
      </div>

      <form className="task-checklist-form" onSubmit={handleAdd}>
        <input
          value={title}
          placeholder="Add checklist item..."
          onChange={(e) => setTitle(e.target.value)}
        />

        <button type="submit">
          <Plus size={16} />
          Add
        </button>
      </form>

      <div className="task-checklist-list">
        {items.map((item) => (
          <div className="task-checklist-item" key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={Boolean(item.is_done)}
                disabled={loadingId === item.id}
                onChange={() => handleToggle(item)}
              />
              <span className={item.is_done ? "done" : ""}>{item.title}</span>
            </label>

            <button
              type="button"
              disabled={loadingId === item.id}
              onClick={() => handleDelete(item.id)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {!items.length && (
          <div className="task-empty-box">
            No checklist items added.
          </div>
        )}
      </div>
    </div>
  );
}