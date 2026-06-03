const nodemailer = require('nodemailer');

const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const isGmail = host?.includes('gmail.com');

  console.log('SMTP CONFIG:', {
    host,
    port,
    userExists: !!user,
    passExists: !!pass,
    isGmail,
    from,
  });

  if (!user || !pass) {
    throw new Error('Email configuration is incomplete. Please set EMAIL_USER and EMAIL_PASS in .env');
  }

  if (isGmail && pass && pass.length < 16) {
    console.warn('Gmail SMTP detected. EMAIL_PASS should be a Gmail App Password, not a normal mailbox password.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  console.log('[email] verifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('[email] SMTP verified successfully');
  } catch (error) {
    console.error('[email] failed:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      message: error.message,
    });
    throw error;
  }

  console.log('SEND EMAIL:', { to, subject, from });
  const sendPromise = transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Email send timed out')), 20000);
  });

  try {
    await Promise.race([sendPromise, timeoutPromise]);
  } catch (error) {
    console.error('[email] failed:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      message: error.message,
    });
    throw error;
  }
};

module.exports = sendEmail;
