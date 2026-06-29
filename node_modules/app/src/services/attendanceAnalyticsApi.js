import { apiRequest } from "./http";

export function fetchAttendanceAnalytics() {
  return apiRequest("/attendance-analytics");
}