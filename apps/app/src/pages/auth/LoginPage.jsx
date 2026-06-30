import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Lock, User } from "lucide-react";
import { loginUser } from "../../services/authApi";
import { setAuthUser } from "../../utils/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await loginUser(form);

      setAuthUser(data.user, data.token);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-card" onSubmit={handleLogin}>
      <div className="card-top-glow" />

      <div className="login-head">
        <h1>Welcome Back</h1>
        <p>Please sign in to continue</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="login-field">
        <label>Username or Email Address</label>
        <div className="login-input">
          <User size={16} />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="login-field">
        <label>Password</label>
        <div className="login-input">
          <Lock size={16} />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
            <Eye size={16} />
          </button>
        </div>
      </div>

      <div className="login-options">
        <label>
          <input type="checkbox" />
          Remember Me
        </label>
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>

      <button className="login-btn" type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
}
