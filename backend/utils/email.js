const nodemailer = require('nodemailer');

const createTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  console.log('SMTP CONFIG:', {
    host,
    port,
    userExists: !!user,
    passExists: !!pass,
    from: process.env.EMAIL_FROM,
  });

  if (!host || !user || !pass) {
    throw new Error('Email configuration is incomplete. Please set EMAIL_HOST, EMAIL_USER and EMAIL_PASS in .env');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  console.log('SEND EMAIL:', { to, subject, from: process.env.EMAIL_FROM });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });
};

module.exports = sendEmail;
