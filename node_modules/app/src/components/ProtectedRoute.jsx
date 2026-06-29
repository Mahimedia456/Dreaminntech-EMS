import { Navigate, useLocation } from "react-router-dom";
import { getAuthUser } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const user = getAuthUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}