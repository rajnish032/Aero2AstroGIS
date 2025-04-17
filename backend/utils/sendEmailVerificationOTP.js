import transporter from "../config/emailConfig.js";
import EmailVerificationModel from "../models/EmailVerification.js";

const sendEmailVerificationOTP = async (req, user) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Generated OTP:", otp);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Verify Your Email",
      html: `<p>Hello ${user.name},</p><p>Your OTP is <strong>${otp}</strong>. It expires in 15 minutes.</p>`,
    };

    console.log("Sending email to:", user.email);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully, Message ID:", info.messageId);

    await EmailVerificationModel.create({
      userId: user._id,
      otp,
    });
    console.log("Email verification record created for user:", user._id);
  } catch (error) {
    console.error("Error sending email:", error.stack);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendEmailVerificationOTP;