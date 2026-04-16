import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getFromEmail(): string {
  const from = process.env.FROM_EMAIL;
  if (!from) throw new Error("FROM_EMAIL is not set");
  return from;
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const confirmLink = `${process.env.CORS_ORIGIN}/verify-email?token=${token}`;
  await resend.emails.send({
    from: getFromEmail(),
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm your email.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetLink = `${process.env.CORS_ORIGIN}/new-password?token=${token}`;
  await resend.emails.send({
    from: getFromEmail(),
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });
}

export async function sendTwoFactorEmail(email: string, code: string): Promise<void> {
  await resend.emails.send({
    from: getFromEmail(),
    to: email,
    subject: "Your two-factor authentication code",
    html: `<p>Your confirmation code: <strong>${code}</strong></p>`,
  });
}
