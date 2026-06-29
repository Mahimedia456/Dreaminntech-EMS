import dotenv from "dotenv";
import { query } from "../config/db.js";
import { hashPassword } from "../utils/password.js";

dotenv.config();

async function run() {
  try {
    const password = "Mahimediasolutions@786";
    const passwordHash = await hashPassword(password);

    const emails = [
      "aamir.ali.422aa@gmail.com",
      "shahid@mahimediasolutions.com",
      "aamir@mahimediasolutions.com",
      "umairawan@mahimediasolutions.com",
      "areeb@mahimediasolutions.com",
      "khawar@mahimediasolutions.com",
      "lamiece@mahimediasolutions.com",
      "maaz@mahimediasolutions.com",
      "meeran@mahimediasolutions.com",
      "roushan@mahimediasolutions.com",
      "umairzaki@mahimediasolutions.com",
      "waji@mahimediasolutions.com",
      "zulqarnain@mahimediasolutions.com",
    ];

    const result = await query(
      `
      UPDATE app_users
      SET password_hash = $1,
          status = 'active',
          updated_at = NOW()
      WHERE LOWER(email) = ANY($2::text[])
      RETURNING email, role, status
      `,
      [passwordHash, emails.map((email) => email.toLowerCase())]
    );

    console.log("Updated users:", result.rows);
    console.log("Password reset to:", password);
    process.exit(0);
  } catch (error) {
    console.error("Reset password script failed:", error);
    process.exit(1);
  }
}

run();