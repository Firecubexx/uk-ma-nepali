const OTP_EMAIL_KEY = 'umn_pending_otp_email';
const OTP_CODE_KEY = 'umn_pending_dev_otp';

export function saveOtpSession(email, devOtp = '') {
  if (email) {
    sessionStorage.setItem(OTP_EMAIL_KEY, email);
  }

  if (devOtp) {
    sessionStorage.setItem(OTP_CODE_KEY, devOtp);
  } else {
    sessionStorage.removeItem(OTP_CODE_KEY);
  }
}

export function readOtpSession() {
  return {
    email: sessionStorage.getItem(OTP_EMAIL_KEY) || '',
    devOtp: sessionStorage.getItem(OTP_CODE_KEY) || '',
  };
}

export function clearOtpSession() {
  sessionStorage.removeItem(OTP_EMAIL_KEY);
  sessionStorage.removeItem(OTP_CODE_KEY);
}
