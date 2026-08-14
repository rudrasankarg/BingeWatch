import nodemailer from "nodemailer";

const sendVerificationEmail = async (email, otp) => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
        console.log("-----------------------------------------");
        console.log(`✉️  [MAIL SERVICE BYPASS]`);
        console.log(`   To: ${email}`);
        console.log(`   Verification OTP: ${otp}`);
        console.log("-----------------------------------------");
        return true;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort),
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        const mailOptions = {
            from: `"BingeWatch Support" <${smtpUser}>`,
            to: email,
            subject: "BingeWatch - Email Verification OTP",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #6366f1; text-align: center;">Welcome to BingeWatch!</h2>
                    <p>Thank you for registering. Please verify your email address to activate your account.</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
                    </div>
                    <p style="color: #ef4444; font-size: 14px;">This OTP is valid for 5 minutes. If you did not request this, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; 2026 BingeWatch. All rights reserved.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Email verification sent to ${email} (Message ID: ${info.messageId})`);
        return true;
    } catch (error) {
        console.error("Error sending verification email:", error.message);
        console.log("-----------------------------------------");
        console.log(`✉️  [MAIL SERVICE ERROR FALLBACK]`);
        console.log(`   To: ${email}`);
        console.log(`   Verification OTP: ${otp}`);
        console.log("-----------------------------------------");
        return true;
    }
};

export { sendVerificationEmail };
