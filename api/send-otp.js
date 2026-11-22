// Vercel Serverless Function: Send real OTP to Gmail via Resend
export default async function handler(req, res) {
  // Enable CORS so Android APK and client apps can call this endpoint
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, otp, purpose = 'Verification' } = req.body || {};

  if (!to || !otp) {
    return res.status(400).json({ error: 'Missing to email or otp' });
  }

  // Resend API key (supports environment variable or fallback)
  const defaultKeyBase64 = 'cmVfQmNzMUd4MUdfQlJTZGhVMjk4c3ptZWZrdUtZUU1qaHlx';
  const RESEND_API_KEY =
    process.env.RESEND_API_KEY ||
    (typeof Buffer !== 'undefined'
      ? Buffer.from(defaultKeyBase64, 'base64').toString('utf-8')
      : atob(defaultKeyBase64));

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Love32 Security <onboarding@resend.dev>',
        to: [to],
        subject: `🔐 Love32 ${purpose} Code: ${otp}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 20px; }
              .card { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border: 1px solid #f43f5e40; border-radius: 20px; max-width: 480px; margin: 20px auto; padding: 32px 28px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
              .logo { display: inline-block; width: 48px; height: 48px; line-height: 48px; background: linear-gradient(135deg, #f43f5e, #ec4899, #a855f7); border-radius: 16px; font-size: 24px; margin-bottom: 16px; }
              h1 { color: #ffffff; font-size: 22px; margin: 0 0 8px 0; font-weight: 800; letter-spacing: -0.5px; }
              .subtitle { color: #94a3b8; font-size: 14px; margin: 0 0 24px 0; }
              .otp-box { background: #020617; border: 2px dashed #f43f5e; border-radius: 16px; padding: 18px 24px; margin: 20px 0; display: inline-block; }
              .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #fb7185; }
              .notice { color: #64748b; font-size: 12px; margin-top: 20px; line-height: 1.5; }
              .footer { border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 28px; color: #475569; font-size: 11px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="logo">💖</div>
              <h1>Love32 Ultra</h1>
              <p class="subtitle">Your 6-digit ${purpose} code is below:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <p class="notice">
                ⏳ This code is valid for <strong>5 minutes</strong>.<br>
                Never share this verification code with anyone.
              </p>
              
              <div class="footer">
                Love32 Ultra Couple Sync • #1 Intimacy & Real-Time Tracking
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, id: data.id });
    } else {
      console.error('[Resend Error]', data);
      return res.status(response.status).json({ success: false, error: data });
    }
  } catch (error) {
    console.error('[API Send OTP Exception]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
