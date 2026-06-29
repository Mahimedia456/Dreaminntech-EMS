import { apiRequest } from "./http";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function fetchPayroll() {
  return apiRequest("/payroll");
}

export function fetchPayrollDetail(id) {
  return apiRequest(`/payroll/${id}`);
}

export function fetchPayrollRuns() {
  return apiRequest("/payroll/runs");
}

export function generatePayroll(payload) {
  return apiRequest("/payroll/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePayroll(id, payload) {
  return apiRequest(`/payroll/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deletePayroll(id) {
  return apiRequest(`/payroll/${id}`, {
    method: "DELETE",
  });
}

export function markPayrollPaid(id) {
  return apiRequest(`/payroll/${id}/paid`, {
    method: "PUT",
  });
}

export function downloadPayrollPdf(id) {
  const token = localStorage.getItem("ems_token");
  window.open(`${API_URL}/payroll/${id}/pdf?token=${token}`, "_blank");
}