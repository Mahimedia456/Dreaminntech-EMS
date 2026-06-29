import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, verifyOtp } from "../../services/authApi";
import { getResetEmail } from "../../utils/auth";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const email = getResetEmail();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  function handleOtpChange(index, value) {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  async function handleVerify(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await verifyOtp({
        email,
        otp: otp.join(""),
      });

      navigate("/reset-password");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      setResending(true);
      setError("");

      await forgotPassword({ email });
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <form className="login-card" onSubmit={handleVerify}>
      <div className="card-top-glow" />

      <div className="login-head">
        <h1>Verify OTP</h1>
        <p>Enter the 6-digit code sent to your email address.</p>
      </div>

      {!email && (
        <div className="auth-error">
          Email not found. Please go back and request OTP again.
        </div>
      )}

      {error && <div className="auth-error">{error}</div>}

      <div className="login-field">
        <label>OTP Code</label>
        <div className="otp-grid">
          {otp.map((digit, index) => (
            <input
              id={`otp-${index}`}
              key={index}
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
            />
          ))}
        </div>
      </div>

      <p className="otp-resend">
        Didn&apos;t receive code?{" "}
        <button type="button" onClick={handleResend} disabled={!email || resending}>
          {resending ? "Sending..." : "Resend OTP"}
        </button>
      </p>

      <button className="login-btn" type="submit" disabled={!email || loading}>
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <div className="auth-back-link">
        <Link to="/login">Back to Login</Link>
      </div>
    </form>
  );
}