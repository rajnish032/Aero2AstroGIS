const API_BASE_URL = "http://localhost:8000/api/auth"; // 

export const sendOtp = async (phone, type) => {
  try {
    const response = await fetch(`${API_BASE_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone, type }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to send OTP");
    return data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, message: error.message };
  }
};

export const verifyOtp = async (phone, otp, type) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone, otp, type }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "OTP verification failed");
    return data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, message: error.message };
  }
};

export const registerUser = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Registration failed");
    return data;
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, message: error.message };
  }
};
