import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
) => {
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: `"FixFlow" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: ` <div> <h2>Reset Your Password</h2> <p>You requested to reset your password.</p> <p> Click the button below to create a new password: </p> <a href="${resetUrl}" style=" display:inline-block; padding:10px 20px; background:#2563eb; color:white; text-decoration:none; border-radius:5px; " > Reset Password </a> <p>This link will expire in 15 minutes.</p> <p> If you did not request this, you can safely ignore this email. </p> </div> `,
  });
};
