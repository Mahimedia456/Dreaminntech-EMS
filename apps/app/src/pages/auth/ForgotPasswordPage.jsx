import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { forgotPassword } from "../../services/authApi";
import { setResetEmail } from "../../utils/auth";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await forgotPassword({ email });

      setResetEmail(email);
      navigate("/verify-otp");
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
        <h1>Forgot Password</h1>
        <p>Enter your email address and we will send you OTP.</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="login-field">
        <label>Email Address</label>
        <div className="login-input">
          <Mail size={16} />
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <button className="login-btn" type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send OTP"}
      </button>

      <div className="auth-back-link">
        <Link to="/login">Back to Login</Link>
      </div>
    </form>
  );
}