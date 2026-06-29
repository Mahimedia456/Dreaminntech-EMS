import { apiRequest } from "./http";

export function fetchCompanySettings() {
  return apiRequest("/settings/company");
}

export function saveCompanySettings(payload) {
  return apiRequest("/settings/company", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function fetchPermissions() {
  return apiRequest("/settings/permissions");
}

export function savePermissions(payload) {
  return apiRequest("/settings/permissions", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}