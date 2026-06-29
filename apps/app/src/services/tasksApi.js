import { apiRequest } from "./http";

export function fetchTasks() {
  return apiRequest("/tasks");
}

export function fetchTaskDetail(id) {
  return apiRequest(`/tasks/${id}`);
}

export function createTask(payload) {
  return apiRequest("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTask(id, payload) {
  return apiRequest(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteTask(id) {
  return apiRequest(`/tasks/${id}`, {
    method: "DELETE",
  });
}

export function updateTaskStatus(id, payload) {
  return apiRequest(`/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateTaskProgress(id, payload) {
  return apiRequest(`/tasks/${id}/progress`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function addTaskComment(id, payload) {
  return apiRequest(`/tasks/${id}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteTaskComment(commentId) {
  return apiRequest(`/tasks/comments/${commentId}`, {
    method: "DELETE",
  });
}

export function addChecklistItem(id, payload) {
  return apiRequest(`/tasks/${id}/checklists`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateChecklistItem(checklistId, payload) {
  return apiRequest(`/tasks/checklists/${checklistId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteChecklistItem(checklistId) {
  return apiRequest(`/tasks/checklists/${checklistId}`, {
    method: "DELETE",
  });
}

export function startTaskTimer(id) {
  return apiRequest(`/tasks/${id}/start-timer`, {
    method: "POST",
  });
}

export function stopTaskTimer(id) {
  return apiRequest(`/tasks/${id}/stop-timer`, {
    method: "POST",
  });
}