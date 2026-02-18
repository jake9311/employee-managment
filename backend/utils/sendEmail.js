const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const axios = require('axios');
async function sendEmail(to, subject, text) {
  if (!to) throw new Error('Email address is required');

  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: { email: process.env.FROM_EMAIL },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: `
        <div style="font-family: Arial; padding: 10px;">
          <h3>${subject}</h3>
          <p>${text}</p>
        </div>
      `,
    },
    {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
    }
  );

  console.log(`Email sent successfully to ${to}`);
}

module.exports = { sendEmail };
