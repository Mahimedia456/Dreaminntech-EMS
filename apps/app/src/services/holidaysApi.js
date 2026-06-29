import { apiRequest } from "./http";

export function fetchHolidays() {
  return apiRequest("/holidays");
}

export function createHoliday(payload) {
  return apiRequest("/holidays", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateHoliday(id, payload) {
  return apiRequest(`/holidays/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteHoliday(id) {
  return apiRequest(`/holidays/${id}`, {
    method: "DELETE",
  });
}