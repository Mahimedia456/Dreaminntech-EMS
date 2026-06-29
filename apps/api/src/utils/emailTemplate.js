export function dreamEmailTemplate({ title, subtitle, content, buttonText, buttonUrl }) {
  return `
  <div style="margin:0;padding:0;background:#030507;font-family:Arial,sans-serif;color:#ffffff;">
    <div style="max-width:620px;margin:0 auto;padding:34px 18px;">
      <div style="text-align:center;margin-bottom:26px;">
        <h1 style="margin:0;font-size:28px;font-weight:900;color:#ffffff;">
          DREAM <span style="color:#e30613;">INNTECH</span>
        </h1>
        <p style="margin:8px 0 0;color:#9ca3af;font-size:14px;">
          Employee Management System
        </p>
      </div>

      <div style="
        background:#0b0f15;
        border:1px solid rgba(239,23,36,.45);
        border-radius:16px;
        padding:28px;
        box-shadow:0 20px 60px rgba(0,0,0,.45);
      ">
        <div style="
          height:2px;
          background:linear-gradient(90deg, transparent, #ff2d39, #ffffff, #ff2d39, transparent);
          margin-bottom:24px;
        "></div>

        <h2 style="margin:0 0 10px;font-size:24px;color:#ffffff;">
          ${title}
        </h2>

        ${
          subtitle
            ? `<p style="margin:0 0 22px;color:#9ca3af;line-height:1.6;">${subtitle}</p>`
            : ""
        }

        <div style="color:#e5e7eb;line-height:1.7;font-size:15px;">
          ${content}
        </div>

        ${
          buttonText && buttonUrl
            ? `
              <div style="margin-top:26px;">
                <a href="${buttonUrl}" style="
                  display:inline-block;
                  background:linear-gradient(180deg,#ff2d39,#e30613);
                  color:#ffffff;
                  text-decoration:none;
                  padding:14px 24px;
                  border-radius:10px;
                  font-weight:800;
                ">
                  ${buttonText}
                </a>
              </div>
            `
            : ""
        }
      </div>

      <p style="text-align:center;color:#64748b;font-size:12px;margin-top:22px;">
        © 2026 Dream InnTech. All rights reserved.
      </p>
    </div>
  </div>
  `;
}

export function otpEmailTemplate(otp) {
  return dreamEmailTemplate({
    title: "Password Reset OTP",
    subtitle: "Use the OTP below to reset your Dream EMS password.",
    content: `
      <p style="margin:0 0 14px;color:#9ca3af;">Your verification code is:</p>
      <div style="
        letter-spacing:10px;
        font-size:34px;
        font-weight:900;
        color:#ffffff;
        background:#11161d;
        border:1px solid rgba(239,23,36,.45);
        border-radius:12px;
        padding:18px;
        text-align:center;
      ">
        ${otp}
      </div>
      <p style="margin:18px 0 0;color:#9ca3af;">
        This OTP will expire in 10 minutes. Do not share this code with anyone.
      </p>
    `,
  });
}