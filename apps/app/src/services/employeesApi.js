import { apiRequest } from "./http";

export function fetchEmployees() {
  return apiRequest("/employees");
}

export function fetchEmployeeDetail(id) {
  return apiRequest(`/employees/${id}`);
}

export function createEmployee(payload) {
  return apiRequest("/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateEmployee(id, payload) {
  return apiRequest(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteEmployee(id) {
  return apiRequest(`/employees/${id}`, {
    method: "DELETE",
  });
}

export function fetchDepartments() {
  return apiRequest("/employees/departments");
}

export function createDepartment(payload) {
  return apiRequest("/employees/departments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateDepartment(id, payload) {
  return apiRequest(`/employees/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteDepartment(id) {
  return apiRequest(`/employees/departments/${id}`, {
    method: "DELETE",
  });
}

export function fetchDesignations() {
  return apiRequest("/employees/designations");
}

export function createDesignation(payload) {
  return apiRequest("/employees/designations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateDesignation(id, payload) {
  return apiRequest(`/employees/designations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteDesignation(id) {
  return apiRequest(`/employees/designations/${id}`, {
    method: "DELETE",
  });
}

export function fetchShifts() {
  return apiRequest("/employees/shifts");
}

export function createShift(payload) {
  return apiRequest("/employees/shifts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateShift(id, payload) {
  return apiRequest(`/employees/shifts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteShift(id) {
  return apiRequest(`/employees/shifts/${id}`, {
    method: "DELETE",
  });
}