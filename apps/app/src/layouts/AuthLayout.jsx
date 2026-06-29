import { Outlet } from "react-router-dom";
import logo from "../assets/logo.webp";

export default function AuthLayout() {
  return (
    <div className="auth-page">
      <div className="auth-frame" />

      <div className="auth-lines">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="auth-shell">
        <div className="auth-brand">
          <img src={logo} alt="Dream InnTech" />
          <p>Employee Management System</p>
        </div>

        <Outlet />

        <p className="auth-footer">
          © 2026 Dream InnTech. All rights reserved.
        </p>
      </div>
    </div>
  );
}