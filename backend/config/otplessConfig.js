import axios from "axios";

const otplessClient = {
  sendOTP: async (phoneNumber, channel = "SMS") => {
    const response = await axios.post(
      "https://auth.otpless.app/auth/otp/v1/send",
      {
        phoneNumber,
        channel,
        expiry: 900,
      },
      {
        headers: {
          "Content-Type": "application/json",
          clientId: process.env.OTPLESS_CLIENT_ID,
          clientSecret: process.env.OTPLESS_CLIENT_SECRET,
        },
      }
    );
    return response.data.orderId;
  },
  verifyOTP: async (phoneNumber, otp, orderId) => {
    const response = await axios.post(
      "https://auth.otpless.app/auth/otp/v1/verify",
      {
        phoneNumber,
        otp,
        orderId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          clientId: process.env.OTPLESS_CLIENT_ID,
          clientSecret: process.env.OTPLESS_CLIENT_SECRET,
        },
      }
    );
    return response.data.isOTPVerified;
  },
};

export default otplessClient;