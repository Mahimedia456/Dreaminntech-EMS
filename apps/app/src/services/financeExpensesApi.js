import { apiRequest } from "./http";

export function fetchFinanceCategories() {
  return apiRequest("/finance-expenses/categories");
}

export function fetchFinanceExpenses(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, value);
    }
  });

  const qs = search.toString();
  return apiRequest(`/finance-expenses${qs ? `?${qs}` : ""}`);
}

export function fetchFinanceExpenseDetail(id) {
  return apiRequest(`/finance-expenses/${id}`);
}

export function createFinanceExpense(payload) {
  return apiRequest("/finance-expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateFinanceExpense(id, payload) {
  return apiRequest(`/finance-expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteFinanceExpense(id) {
  return apiRequest(`/finance-expenses/${id}`, {
    method: "DELETE",
  });
}

export function submitFinanceExpense(id) {
  return apiRequest(`/finance-expenses/${id}/submit`, {
    method: "PUT",
  });
}

export function reviewFinanceExpense(id, payload) {
  return apiRequest(`/finance-expenses/${id}/review`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function addFinanceExpenseFile(id, payload) {
  return apiRequest(`/finance-expenses/${id}/files`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteFinanceExpenseFile(fileId) {
  return apiRequest(`/finance-expenses/files/${fileId}`, {
    method: "DELETE",
  });
}