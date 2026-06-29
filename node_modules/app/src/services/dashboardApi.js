import { apiRequest } from "./http";

export function fetchDashboard() {
  return apiRequest("/dashboard");
}