import { apiRequest } from "./http";

export function fetchLeaveRequests() {
  return apiRequest("/leaves");
}

export function createLeaveRequest(payload) {
  return apiRequest("/leaves", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchLeaveTypes() {
  return apiRequest("/leaves/types");
}

export function fetchLeaveBalances() {
  return apiRequest("/leaves/balances");
}

export function approveLeaveRequest(id) {
  return apiRequest(`/leaves/${id}/approve`, {
    method: "PUT",
  });
}

export function rejectLeaveRequest(id, payload) {
  return apiRequest(`/leaves/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function cancelLeaveRequest(id) {
  return apiRequest(`/leaves/${id}/cancel`, {
    method: "PUT",
  });
}