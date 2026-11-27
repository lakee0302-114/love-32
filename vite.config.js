import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import https from 'node:https'

const sendOtpPlugin = () => ({
  name: 'send-otp-plugin',
  configureServer(server) {
    server.middlewares.use('/api/send-otp', (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method Not Allowed');
        return;
      }
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { to, otp, purpose = 'Verification' } = JSON.parse(body || '{}');
          const postData = JSON.stringify({
            from: 'Love32 Security <onboarding@resend.dev>',
            to: [to || 'lakee0302@gmail.com'],
            subject: `🔐 Love32 ${purpose} Code: ${otp}`,
            html: `
              <div style="font-family:sans-serif;padding:24px;text-align:center;background:#0f172a;color:#ffffff;border-radius:16px;">
                <h2 style="color:#f43f5e;margin-bottom:8px;">Love32 Ultra</h2>
                <p style="color:#cbd5e1;font-size:14px;">Your verification code is:</p>
                <div style="margin:20px 0;">
                  <span style="letter-spacing:6px;font-size:32px;font-weight:bold;color:#fb7185;background:#1e293b;padding:12px 24px;border-radius:12px;display:inline-block;border:1px solid #f43f5e;">${otp}</span>
                </div>
                <p style="color:#94a3b8;font-size:12px;">Valid for 10 minutes. If you did not request this, please ignore.</p>
              </div>
            `
          });
          const apiReq = https.request('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + (process.env.RESEND_API_KEY || ''),
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
            }
          }, apiRes => {
            let apiData = '';
            apiRes.on('data', d => apiData += d);
            apiRes.on('end', () => {
              res.statusCode = apiRes.statusCode || 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(apiData);
            });
          });
          apiReq.on('error', err => {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          });
          apiReq.write(postData);
          apiReq.end();
        } catch (e) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), sendOtpPlugin()],
})
