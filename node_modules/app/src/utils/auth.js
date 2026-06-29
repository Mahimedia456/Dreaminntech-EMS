const USER_KEY = "ems_user";
const TOKEN_KEY = "ems_token";
const RESET_EMAIL_KEY = "ems_reset_email";

export function setAuthUser(user, token) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthUser() {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return {
      name: "Guest",
      email: "",
      role: "employee",
    };
  }

  return JSON.parse(user);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function setResetEmail(email) {
  localStorage.setItem(RESET_EMAIL_KEY, email);
}

export function getResetEmail() {
  return localStorage.getItem(RESET_EMAIL_KEY);
}

export function clearResetEmail() {
  localStorage.removeItem(RESET_EMAIL_KEY);
}