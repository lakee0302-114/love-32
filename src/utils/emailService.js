// Real Email OTP Dispatch Engine for Love32
import emailjs from '@emailjs/browser';

const EMAIL_SERVICE_CONFIG_KEY = 'love32_email_service_config';

export const getEmailConfig = () => {
  try {
    const raw = localStorage.getItem(EMAIL_SERVICE_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    appsScriptUrl: '',
    emailJsServiceId: '',
    emailJsTemplateId: '',
    emailJsPublicKey: '',
  };
};

export const saveEmailConfig = (config) => {
  try {
    localStorage.setItem(EMAIL_SERVICE_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {}
};

/**
 * Dispatch real OTP email directly to user's Gmail
 */
export async function sendOtpToGmail({ toEmail, otpCode, purpose = 'Verification' }) {
  if (!toEmail || !otpCode) return { success: false, error: 'Missing email or OTP' };

  console.log(`[EmailService] Sending real OTP to ${toEmail}...`);

  // 1. Try Vercel Serverless Function /api/send-otp
  try {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: toEmail,
        otp: otpCode,
        purpose,
      }),
    });
    if (res.ok) {
      return { success: true };
    }
  } catch (err) {}

  // 2. Try Google Apps Script Webhook (Zero API key Google Gmail relay)
  const config = getEmailConfig();
  if (config.appsScriptUrl) {
    try {
      await fetch(config.appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          to: toEmail,
          subject: `🔐 Love32 ${purpose} Code: ${otpCode}`,
          body: `Hi,\n\nYour Love32 6-digit OTP verification code is: ${otpCode}\n\nThis code will expire in 5 minutes.\n\nNever share this code with anyone.\n\nLove32 Security Team`,
        }),
      });
      return { success: true };
    } catch (e) {}
  }

  // 3. Try EmailJS Browser Client
  if (config.emailJsServiceId && config.emailJsTemplateId && config.emailJsPublicKey) {
    try {
      await emailjs.send(
        config.emailJsServiceId,
        config.emailJsTemplateId,
        {
          to_email: toEmail,
          otp: otpCode,
          purpose,
        },
        config.emailJsPublicKey
      );
      return { success: true };
    } catch (e) {}
  }

  return { success: false };
}
