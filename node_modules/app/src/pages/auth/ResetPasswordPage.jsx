import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Lock } from "lucide-react";
import { resetPassword } from "../../services/authApi";
import { clearResetEmail, getResetEmail } from "../../utils/auth";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const email = getResetEmail();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
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

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await resetPassword({
        email,
        password: form.password,
      });

      clearResetEmail();
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <div className="card-top-glow" />

      <div className="login-head">
        <h1>Reset Password</h1>
        <p>Create a new password for your account.</p>
      </div>

      {!email && (
        <div className="auth-error">
          Email not found. Please request OTP again.
        </div>
      )}

      {error && <div className="auth-error">{error}</div>}

      <div className="login-field">
        <label>New Password</label>
        <div className="login-input">
          <Lock size={16} />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={form.password}
            onChange={handleChange}
          />
          <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
            <Eye size={16} />
          </button>
        </div>
      </div>

      <div className="login-field">
        <label>Confirm New Password</label>
        <div className="login-input">
          <Lock size={16} />
          <input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
          <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
            <Eye size={16} />
          </button>
        </div>
      </div>

      <button className="login-btn" type="submit" disabled={!email || loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>

      <div className="auth-back-link">
        <Link to="/login">Back to Login</Link>
      </div>
    </form>
  );
}