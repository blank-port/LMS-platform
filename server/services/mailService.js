import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: '"PrismEd LMS" <noreply@prismed.com>',
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
                            <p>© 2026 PrismEd LMS. All rights reserved.</p>
                            <p>Powered by Advanced Agentic Learning Systems</p>
                        </div>
                    </div>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email Sending Error:', error);
        return false;
    }
};
