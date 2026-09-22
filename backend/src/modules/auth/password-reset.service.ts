import crypto from "node:crypto";
import argon2 from "argon2";
import {
  createPasswordResetTokenRepository,
  getPasswordResetTokenRepository,
  getUserByEmailRepository,
  markPasswordResetTokenUsedRepository,
  updatePasswordRepository,
} from "./auth.repository.js";
import { sendPasswordResetEmail } from "./sendPasswordResetEmail.js";

export const forgotPasswordService = async (email: string) => {
  const user = await getUserByEmailRepository(email);

  // Don't reveal whether email exists
  if (!user) {
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await createPasswordResetTokenRepository(user.id, tokenHash, expiresAt);

  await sendPasswordResetEmail(user.email, resetToken);
};
export const resetPasswordService = async (
  token: string ,
  newPassword: string,
) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const resetToken = await getPasswordResetTokenRepository(tokenHash);
  if (!resetToken) {
    throw new Error("Invalid or expired reset token");
  }
  const passwordHash = await argon2.hash(newPassword);
  const user = await updatePasswordRepository(resetToken.user_id, passwordHash);
  await markPasswordResetTokenUsedRepository(resetToken.id);
  return user;
};
