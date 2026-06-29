import { apiRequest } from "./http";

export function fetchTodayAttendance() {
  return apiRequest("/attendance/today");
}

export function fetchAttendanceHistory(params = "") {
  return apiRequest(`/attendance/history${params}`);
}

export function fetchAttendanceSummary() {
  return apiRequest("/attendance/summary");
}

export function checkIn() {
  return apiRequest("/attendance/check-in", {
    method: "POST",
  });
}

export function lunchOut() {
  return apiRequest("/attendance/lunch-out", {
    method: "POST",
  });
}

export function lunchIn() {
  return apiRequest("/attendance/lunch-in", {
    method: "POST",
  });
}

export function breakOut() {
  return apiRequest("/attendance/break-out", {
    method: "POST",
  });
}

export function breakIn() {
  return apiRequest("/attendance/break-in", {
    method: "POST",
  });
}

export function checkOut() {
  return apiRequest("/attendance/check-out", {
    method: "POST",
  });
}

export function submitDailyReport(payload) {
  return apiRequest("/attendance/daily-report", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}