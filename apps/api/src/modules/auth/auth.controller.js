import { query } from "../../config/db.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { signToken } from "../../utils/jwt.js";
import { sendOtpEmail } from "../../utils/mailer.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function login(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await query(
      `
      SELECT id, username, full_name, email, role, password_hash, status
      FROM app_users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [email]
    );

    const user = result.rows[0];

    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const matched = await comparePassword(password, user.password_hash);

    if (!matched) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function me(req, res) {
  try {
    const result = await query(
      `
      SELECT id, username, full_name, email, role, status
      FROM app_users
      WHERE id = $1
      LIMIT 1
      `,
      [req.user.id]
    );

    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function forgotPassword(req, res) {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userResult = await query(
      `
      SELECT id, email, status
      FROM app_users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [email]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    const otp = generateOtp();

    await query(
      `
      UPDATE password_reset_otps
      SET used = TRUE
      WHERE LOWER(email) = LOWER($1)
      AND used = FALSE
      `,
      [email]
    );

    await query(
      `
      INSERT INTO password_reset_otps
      (user_id, email, otp, expires_at, verified, used)
      VALUES
      ($1, $2, $3, NOW() + INTERVAL '10 minutes', FALSE, FALSE)
      `,
      [user.id, user.email, otp]
    );

    await sendOtpEmail(user.email, otp);

    return res.json({
      message: "OTP sent successfully",
      devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
}

export async function verifyOtp(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const result = await query(
      `
      SELECT id
      FROM password_reset_otps
      WHERE LOWER(email) = LOWER($1)
      AND otp = $2
      AND expires_at > NOW()
      AND used = FALSE
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [email, otp]
    );

    const record = result.rows[0];

    if (!record) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await query(
      `
      UPDATE password_reset_otps
      SET verified = TRUE
      WHERE id = $1
      `,
      [record.id]
    );

    return res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function resetPassword(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const otpResult = await query(
      `
      SELECT id
      FROM password_reset_otps
      WHERE LOWER(email) = LOWER($1)
      AND verified = TRUE
      AND used = FALSE
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [email]
    );

    const otpRecord = otpResult.rows[0];

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    const passwordHash = await hashPassword(password);

    await query(
      `
      UPDATE app_users
      SET password_hash = $1, updated_at = NOW()
      WHERE LOWER(email) = LOWER($2)
      `,
      [passwordHash, email]
    );

    await query(
      `
      UPDATE password_reset_otps
      SET used = TRUE
      WHERE id = $1
      `,
      [otpRecord.id]
    );

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}