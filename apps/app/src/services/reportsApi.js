import { apiRequest } from "./http";

export function fetchReportsSummary() {
  return apiRequest("/reports/summary");
}

export function fetchReportData(type) {
  return apiRequest(`/reports/${type}`);
}