const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is required for email sending. Set it in your environment.');
}

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || 'Smart Tech <support@smarttech-lanka.com>';
  const replyTo = process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER || 'smarttechlanka.support@gmail.com';
  console.log('[email] sending via Resend...', { to, subject, from, replyTo });

  try {
    const response = await resend.emails.send({
      from,
      replyTo,
      to,
      subject,
      html,
      text,
    });

    console.log('[email] sent successfully', {
      id: response.id,
      status: response.status,
      to: response.to,
      message: response?.message || 'Sent',
    });
    return response;
  } catch (error) {
    console.error('[email] failed:', {
      code: error.code,
      type: error.type,
      status: error.status,
      response: error.response,
      message: error.message,
    });
    throw error;
  }
};

module.exports = sendEmail;
