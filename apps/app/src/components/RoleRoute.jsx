import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthUser } from "../utils/auth";

export default function RoleRoute({ roles = [], children }) {
  const location = useLocation();
  const user = getAuthUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{
          from: location.pathname,
          reason: "unauthorized",
        }}
      />
    );
  }

  return children;
}
