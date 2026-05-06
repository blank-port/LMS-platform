import nodemailer from 'nodemailer';
import Setting from '../models/Setting.js';

// Strategic Transporter Provisioning: Unified SMTP Engine
const getTransporter = async () => {
  const keys = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from'];
  const docs = await Setting.find({ key: { $in: keys } });
  const cfg = {};
  docs.forEach(d => cfg[d.key] = d.value);

  // Priority 1: Environment Variables (Production Managed)
  const host = process.env.SMTP_HOST || cfg.smtp_host;
  const user = process.env.SMTP_USER || cfg.smtp_user;
  const pass = process.env.SMTP_PASS || cfg.smtp_pass;
  const port = parseInt(process.env.SMTP_PORT || cfg.smtp_port) || 587;
  const fromAddress = process.env.SMTP_FROM || cfg.smtp_from || `"PrismEd LMS" <${user}>`;

  // If no SMTP configured anywhere, return a mock transporter to avoid blocking
  if (!host || !user) {
    return {
      transporter: {
        sendMail: async (mailOptions) => {
          console.log('\n[Development Mode] Email intercepted (No SMTP configured):');
          console.log('To:', mailOptions.to);
          console.log('Subject:', mailOptions.subject);
          console.log('Content snippet:', mailOptions.html.substring(0, 100) + '...\n');
          return { messageId: 'mock-id-' + Date.now() };
        }
      },
      from: 'PrismEd (Test) <noreply@prismed.local>',
      isTest: true
    };
  }

  const t = nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465,
    auth: { user: user, pass: pass }
  });
  return { transporter: t, from: fromAddress, isTest: false };
};

/**
 * Send welcome/credentials email to newly registered AI chat user
 */
export const sendWelcomeEmail = async ({ name, email, password, loginUrl = 'http://localhost:3000/login' }) => {
  try {
    const { transporter, from, isTest } = await getTransporter();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f0f1a; color: #e2e8f0; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #1a1a2e; border-radius: 24px; overflow: hidden; border: 1px solid #2d2d4e; }
    .header { background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 40px 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0; color: rgba(255,255,255,0.7); font-size: 13px; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 18px; font-weight: 700; color: #c4b5fd; margin-bottom: 16px; }
    .text { font-size: 14px; color: #94a3b8; line-height: 1.7; margin-bottom: 24px; }
    .cred-box { background: #0f0f1a; border: 1px solid #7c3aed44; border-radius: 16px; padding: 24px; margin: 24px 0; }
    .cred-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #2d2d4e; }
    .cred-row:last-child { border-bottom: none; }
    .cred-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
    .cred-value { font-size: 14px; font-weight: 700; color: #e2e8f0; font-family: monospace; }
    .btn { display: block; text-align: center; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff !important; 
           text-decoration: none; padding: 16px 32px; border-radius: 14px; font-weight: 800; font-size: 15px; margin: 28px 0; }
    .footer { background: #0f0f1a; padding: 24px 40px; text-align: center; font-size: 11px; color: #475569; border-top: 1px solid #2d2d4e; }
    .security-note { background: #1e1e3a; border: 1px solid #334155; border-radius: 12px; padding: 14px 18px; font-size: 12px; color: #64748b; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Welcome to PrismEd</h1>
      <p>Your learning journey starts here</p>
    </div>
    <div class="body">
      <div class="greeting">Hi ${name}! 👋</div>
      <p class="text">Your account has been created successfully. Here are your login credentials — store them safely.</p>
      
      <div class="cred-box">
        <div class="cred-row">
          <span class="cred-label">Platform URL</span>
          <span class="cred-value">${loginUrl}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Email</span>
          <span class="cred-value">${email}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Password</span>
          <span class="cred-value">${password}</span>
        </div>
      </div>

      <a href="${loginUrl}" class="btn">Access Your Dashboard →</a>

      <div class="security-note">
        🔒 <strong>Security Protocol:</strong> You will be required to change this temporary password upon your first login.
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} PrismEd · Shaping Skills · You received this because you registered via our AI Assistant.
    </div>
  </div>
</body>
</html>`;

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: `🎓 Welcome to PrismEd — Your Login Credentials`,
      html
    });

    const previewUrl = isTest ? nodemailer.getTestMessageUrl(info) : null;
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('[EmailService] Failed to send welcome email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP for account verification
 */
export const sendOTP = async (email, otp) => {
    try {
        const { transporter, from } = await getTransporter();
        const mailOptions = {
            from,
            to: email,
            subject: '🔐 Verify Your PrismEd Scholar Identity',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; padding: 40px; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                        <div style="background-color: #4f46e5; padding: 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">PrismEd LMS</h1>
                            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Identity Verification</p>
                        </div>
                        <div style="padding: 40px;">
                            <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px; color: #1f2937;">Welcome to the Sanctuary of Learning!</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">To activate your scholar account and begin your journey, please verify your email address using the one-time passcode below:</p>
                            
                            <div style="margin: 30px 0; text-align: center; background-color: #f3f4f6; border-radius: 12px; padding: 25px; border: 2px dashed #e5e7eb;">
                                <span style="font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #4f46e5; font-family: 'Courier New', Courier, monospace;">${otp}</span>
                            </div>
                            
                            <p style="font-size: 14px; color: #6b7280; margin-bottom: 30px;">This code is valid for 24 hours. If you did not request this, please ignore this email.</p>
                            
                            <div style="border-top: 1px solid #e5e7eb; pt-30px; text-align: center; color: #9ca3af; font-size: 12px;">
                                <p>© ${new Date().getFullYear()} PrismEd LMS. All rights reserved.</p>
                                <p>Powered by Advanced Agentic Learning Systems</p>
                            </div>
                        </div>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        return !!result.messageId;
    } catch (error) {
        console.error('[EmailService] OTP Dispatch Error:', error.message);
        return false;
    }
};

/**
 * Send Course Completion Notification
 */
export const sendCourseCompletionEmail = async (email, userName, courseTitle) => {
    try {
        const { transporter, from } = await getTransporter();
        const mailOptions = {
            from,
            to: email,
            subject: `🎉 Congratulations on Completing ${courseTitle}!`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; padding: 40px; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                        <div style="background-color: #4f46e5; padding: 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Mastery Achieved!</h1>
                            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Academic Milestone Recorded</p>
                        </div>
                        <div style="padding: 40px;">
                            <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px; color: #1f2937;">Kudos, ${userName}!</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">You have successfully navigated the complexities of <strong>${courseTitle}</strong>. This accomplishment marks a significant expansion of your professional and intellectual horizon.</p>
                            
                            <div style="margin: 30px 0; text-align: center; background-color: #f3f4f6; border-radius: 12px; padding: 25px;">
                                <p style="margin: 0; color: #4b5563; font-size: 16px;">"The beautiful thing about learning is that no one can take it away from you."</p>
                                <p style="margin: 10px 0 0 0; color: #4f46e5; font-weight: 700;">— B.B. King</p>
                            </div>
                            
                            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Your certificate is now available in your scholarship dashboard. Continue your quest by exploring new domains in our catalog.</p>
                            
                            <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
                                <p>© ${new Date().getFullYear()} PrismEd LMS. All rights reserved.</p>
                                <p>Powered by Advanced Agentic Learning Systems</p>
                            </div>
                        </div>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        return !!result.messageId;
    } catch (error) {
        console.error('[EmailService] Course Completion Alert Error:', error.message);
        return false;
    }
};
