import { dreamEmailTemplate } from "../../utils/emailTemplate.js";
import { transporter } from "../../utils/mailer.js";

function canSendMail() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendLeaveEmail({ to, subject, title, subtitle, content }) {
  if (!canSendMail()) {
    console.log("Leave email skipped:", { to, subject });
    return;
  }

  return transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html: dreamEmailTemplate({
      title,
      subtitle,
      content,
    }),
  });
}