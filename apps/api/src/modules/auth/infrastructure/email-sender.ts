import nodemailer from "nodemailer";
import { env } from "../../../config/env.js";
import type { EmailSender, VerificationEmailResult } from "../domain/email-sender.js";

export class VerificationEmailSender implements EmailSender {
  async sendVerificationEmail(
    email: string,
    verificationUrl: string
  ): Promise<VerificationEmailResult> {
    if (!env.SMTP_HOST || !env.SMTP_PORT || !env.EMAIL_FROM) {
      console.log(`Verification link for ${email}: ${verificationUrl}`);
      return { previewUrl: verificationUrl };
    }

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:
        env.SMTP_USER && env.SMTP_PASSWORD
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASSWORD
            }
          : undefined
    });

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Verify your Miami Tix account",
      text: `Tap this link to verify your email: ${verificationUrl}`,
      html: `<p>Tap this link to verify your Miami Tix account:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`
    });

    return {};
  }
}
