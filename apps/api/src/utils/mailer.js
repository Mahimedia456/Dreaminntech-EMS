import nodemailer from "nodemailer";
import { otpEmailTemplate } from "./emailTemplate.js";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

export async function sendOtpEmail(email, otp) {
  if (!hasSmtpConfig()) {
    console.log("SMTP not configured. Dev OTP:", {
      email,
      otp,
    });

    return {
      devMode: true,
    };
  }

  return transporter.sendMail({
    from:
      process.env.MAIL_FROM ||
      process.env.SMTP_USER,

    to: email,

    subject:
      "Dream EMS Password Reset OTP",

    html: otpEmailTemplate(otp),
  });
}