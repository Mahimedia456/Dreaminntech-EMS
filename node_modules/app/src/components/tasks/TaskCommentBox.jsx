import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import {
  addTaskComment,
  deleteTaskComment,
} from "../../services/tasksApi";
import { getAuthUser } from "../../utils/auth";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function TaskCommentBox({ taskId, comments = [], onUpdated }) {
  const user = getAuthUser();

  const [comment, setComment] = useState("");
  const [loadingId, setLoadingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      setError("");

      await addTaskComment(taskId, {
        comment,
      });

      setComment("");
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId) {
    if (!window.confirm("Delete this comment?")) return;

    try {
      setLoadingId(commentId);
      setError("");

      await deleteTaskComment(commentId);

      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId("");
    }
  }

  const canDeleteAny = user.role === "admin" || user.role === "manager";

  return (
    <div className="dashboard-card">
      <h2>Comments</h2>

      {error && <div className="auth-error">{error}</div>}

      <form className="task-comment-form" onSubmit={handleSubmit}>
        <textarea
          value={comment}
          placeholder="Write a comment..."
          onChange={(e) => setComment(e.target.value)}
        />

        <button className="login-btn" type="submit" disabled={submitting}>
          <Send size={16} />
          {submitting ? "Sending..." : "Send"}
        </button>
      </form>

      <div className="task-comments-list">
        {comments.map((item) => {
          const canDeleteOwn =
            item.user_id === user.id || item.user_id === user.user_id;

          return (
            <div className="task-comment-item" key={item.id}>
              <div>
                <strong>{item.full_name || "User"}</strong>
                <span>{formatDate(item.created_at)}</span>
              </div>

              <p>{item.comment}</p>

              {(canDeleteAny || canDeleteOwn) && (
                <button
                  type="button"
                  disabled={loadingId === item.id}
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </div>
          );
        })}

        {!comments.length && (
          <div className="task-empty-box">
            No comments yet.
          </div>
        )}
      </div>
    </div>
  );
}