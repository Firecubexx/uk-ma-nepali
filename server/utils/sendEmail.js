const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  const { EMAIL_USER, EMAIL_PASS, SMTP_HOST, SMTP_PORT, SMTP_SECURE } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email service is not configured. Set EMAIL_USER and EMAIL_PASS in server/.env');
  }

  try {
    const transporter = SMTP_HOST
      ? nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT) || 587,
          secure: SMTP_SECURE === 'true',
          auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
          },
        })
      : nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
          },
        });

    await transporter.sendMail({
      from: `"UK ma Nepali" <${EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log('Email sent to:', to);
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Failed to deliver OTP email');
  }
};

module.exports = sendEmail;
