import React, { useEffect, useState } from "react";
import { Clock, Play, Square, X } from "lucide-react";

import {
  fetchTaskDetail,
  startTaskTimer,
  stopTaskTimer,
  updateTaskProgress,
  updateTaskStatus,
} from "../../services/tasksApi";

import TaskChecklistBox from "./TaskChecklistBox";
import TaskCommentBox from "./TaskCommentBox";

function formatDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 10);
}

function formatMinutes(minutes = 0) {
  const total = Number(minutes || 0);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${m}m`;
}

export default function TaskViewModal({ open, task, onClose, onUpdated }) {
  const [detail, setDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [activities, setActivities] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  async function loadDetail() {
    if (!task?.id) return;

    try {
      setLoading(true);
      setError("");

      const data = await fetchTaskDetail(task.id);

      setDetail(data.task);
      setComments(data.comments || []);
      setChecklists(data.checklists || []);
      setActivities(data.activities || []);
      setTimeLogs(data.timeLogs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(status) {
    try {
      setActionLoading("status");
      await updateTaskStatus(task.id, { status });
      await loadDetail();
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading("");
    }
  }

  async function handleProgressChange(progress) {
    try {
      setActionLoading("progress");
      await updateTaskProgress(task.id, { progress: Number(progress) });
      await loadDetail();
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading("");
    }
  }

  async function handleStartTimer() {
    try {
      setActionLoading("timer");
      await startTaskTimer(task.id);
      await loadDetail();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading("");
    }
  }

  async function handleStopTimer() {
    try {
      setActionLoading("timer");
      await stopTaskTimer(task.id);
      await loadDetail();
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading("");
    }
  }

  useEffect(() => {
    if (open) loadDetail();
  }, [open, task?.id]);

  if (!open || !task) return null;

  const current = detail || task;
  const activeTimer = timeLogs.find((log) => !log.end_time);
  const totalMinutes = timeLogs.reduce(
    (sum, log) => sum + Number(log.minutes || 0),
    0
  );

  return (
    <div className="modal-overlay">
      <div className="task-view-modal">
        <div className="checkout-header">
          <div>
            <h2>{current.title}</h2>
            <p>
              {current.project_title || "No Project"} • {current.priority} •{" "}
              {current.status}
            </p>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {loading ? (
          <div className="dashboard-card">Loading task detail...</div>
        ) : (
          <div className="task-view-grid">
            <div className="task-view-main">
              <div className="dashboard-card">
                <h2>Task Overview</h2>

                <div className="profile-info">
                  <Info label="Assigned To" value={current.assigned_name || "-"} />
                  <Info label="Assigned By" value={current.assigned_by_name || "-"} />
                  <Info label="Start Date" value={formatDate(current.start_date)} />
                  <Info label="Due Date" value={formatDate(current.due_date)} />
                  <Info label="Estimated Hours" value={current.estimated_hours || 0} />
                  <Info label="Actual Hours" value={current.actual_hours || 0} />
                </div>

                <div className="task-description-box">
                  <strong>Description</strong>
                  <p>{current.description || "No description added."}</p>
                </div>
              </div>

              <TaskChecklistBox
                taskId={current.id}
                items={checklists}
                onUpdated={loadDetail}
              />

              <TaskCommentBox
                taskId={current.id}
                comments={comments}
                onUpdated={loadDetail}
              />

              <div className="dashboard-card">
                <h2>Activity</h2>

                <div className="dashboard-list">
                  {activities.map((item) => (
                    <div key={item.id}>
                      <strong>{item.action}</strong>
                      <span>
                        {item.description} • {item.full_name || "System"} •{" "}
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  ))}

                  {!activities.length && (
                    <div>
                      <strong>No activity found</strong>
                      <span>-</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="task-view-side">
              <div className="dashboard-card">
                <h2>Status</h2>

                <div className="leave-form">
                  <label>Change Status</label>
                  <select
                    value={current.status}
                    disabled={actionLoading === "status"}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="testing">Testing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <label>Progress %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={current.progress || 0}
                    disabled={actionLoading === "progress"}
                    onChange={(e) => handleProgressChange(e.target.value)}
                  />

                  <div className="project-progress">
                    <div style={{ width: `${current.progress || 0}%` }} />
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <h2>Time Tracker</h2>

                <div className="profile-info">
                  <Info label="Total Logged" value={formatMinutes(totalMinutes)} />
                  <Info
                    label="Timer"
                    value={activeTimer ? "Running" : "Stopped"}
                  />
                </div>

                <div className="task-timer-actions">
                  {!activeTimer ? (
                    <button
                      className="login-btn"
                      disabled={actionLoading === "timer"}
                      onClick={handleStartTimer}
                    >
                      <Play size={16} />
                      Start Timer
                    </button>
                  ) : (
                    <button
                      className="login-btn"
                      disabled={actionLoading === "timer"}
                      onClick={handleStopTimer}
                    >
                      <Square size={16} />
                      Stop Timer
                    </button>
                  )}
                </div>
              </div>

              <div className="dashboard-card">
                <h2>Time Logs</h2>

                <div className="dashboard-list">
                  {timeLogs.map((log) => (
                    <div key={log.id}>
                      <strong>
                        <Clock size={14} /> {formatMinutes(log.minutes)}
                      </strong>
                      <span>
                        {log.full_name} • {log.end_time ? "Completed" : "Running"}
                      </span>
                    </div>
                  ))}

                  {!timeLogs.length && (
                    <div>
                      <strong>No time logs</strong>
                      <span>-</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="checkout-footer">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Close
          </button>
        </div>
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
