import { apiRequest } from "./http";

export function fetchProjects() {
  return apiRequest("/projects");
}

export function fetchProjectDetail(id) {
  return apiRequest(`/projects/${id}`);
}

export function createProject(payload) {
  return apiRequest("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProject(id, payload) {
  return apiRequest(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProject(id) {
  return apiRequest(`/projects/${id}`, {
    method: "DELETE",
  });
}

export function addProjectMember(projectId, payload) {
  return apiRequest(`/projects/${projectId}/members`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function removeProjectMember(projectId, memberId) {
  return apiRequest(`/projects/${projectId}/members/${memberId}`, {
    method: "DELETE",
  });
}

export function createProjectTask(projectId, payload) {
  return apiRequest(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProjectTask(projectId, taskId, payload) {
  return apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProjectTask(projectId, taskId) {
  return apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
  });
}