import { apiRequest } from "./http";

export function fetchMyProfile() {
  return apiRequest("/profile/me");
}

export function updateMyProfile(payload) {
  return apiRequest("/profile/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}