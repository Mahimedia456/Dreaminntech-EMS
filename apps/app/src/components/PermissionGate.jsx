import { getAuthUser } from "../utils/auth";

export default function PermissionGate({
  roles = [],
  children,
  fallback = null,
}) {
  const user = getAuthUser();

  if (!user) return fallback;

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return fallback;
  }

  return children;
}