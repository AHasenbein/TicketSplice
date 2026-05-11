export interface VerificationEmailResult {
  previewUrl?: string;
}

export interface EmailSender {
  sendVerificationEmail(email: string, verificationUrl: string): Promise<VerificationEmailResult>;
}
