let nodemailer;
try {
  nodemailer = require("nodemailer");
} catch (e) {
  nodemailer = null;
}

function getTransporter() {
  const user = process.env.EMAIL_USER || "asuukadavid@gmail.com";
  const pass = (process.env.EMAIL_PASS || "jdtc sjfs vdup yyzv").replace(/\s+/g, "");

  if (!nodemailer) {
    console.log("[EmailService] Nodemailer not yet loaded. Skipping transporter creation.");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Dispatches a 6-digit verification OTP code to the recipient's email address
 */
async function sendVerificationEmail(toEmail, code) {
  const user = process.env.EMAIL_USER || "asuukadavid@gmail.com";
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[EmailService - Mock Mode] Code for ${toEmail}: ${code}`);
    return { success: true, mocked: true };
  }

  const mailOptions = {
    from: `"SpendSense Verification" <${user}>`,
    to: toEmail,
    subject: `SpendSense Verification Code: ${code}`,
    text: `Hello,\n\nYour SpendSense 6-digit verification code is: ${code}\n\nThis code will expire in 15 minutes.\nIf you did not request this verification, you can safely ignore this email.\n\nBest regards,\nSpendSense Team`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #090D16; color: #F8FAFC; border-radius: 16px; border: 1px solid #1E293B;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #3B82F6; font-size: 24px; font-weight: 900; letter-spacing: 2px; margin: 0;">SPENDSENSE</h1>
          <p style="color: #94A3B8; font-size: 13px; margin-top: 4px;">Personal Financial Intelligence Vault</p>
        </div>
        
        <div style="background-color: #0F172A; border: 1px solid #334155; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #94A3B8; font-size: 14px; margin: 0 0 16px 0;">Your one-time account verification code is:</p>
          <div style="display: inline-block; background-color: rgba(37, 99, 235, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 12px; padding: 14px 28px;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 900; color: #60A5FA; letter-spacing: 6px;">${code}</span>
          </div>
          <p style="color: #64748B; font-size: 12px; margin-top: 16px; margin-bottom: 0;">Code expires in 15 minutes • Do not share this code with anyone</p>
        </div>

        <p style="color: #64748B; font-size: 12px; line-height: 18px; text-align: center; margin: 0;">
          If you did not request email verification for SpendSense, please disregard this automated notification.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Verification email delivered to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendVerificationEmail,
};
