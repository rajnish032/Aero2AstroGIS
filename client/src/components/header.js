"use client";
import Link from "next/link";
import { Form, Input, Spin, Button } from "antd";
import { CheckOutlined, KeyOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Cookies from "universal-cookie";
import Image from "next/image";

const cookies = new Cookies(null, { path: "/", sameSite: "lax" });

export default function Register() {
  const [details, setDetails] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+91",
    areaPin: "",
    locality: "",
    city: "",
    state: "",
    password: "",
  });

  const [step, setStep] = useState(0);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState([]);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const fetchLocationDetails = async (pinCode) => {
    if (pinCode.length !== 6) return;

    setRegLoading(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
      const data = await response.json();
      const pinData = data[0];

      if (pinData.Status === "Success" && pinData.PostOffice?.length > 0) {
        const postOffice = pinData.PostOffice[0];
        setDetails((prev) => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State,
          locality: postOffice.Name,
        }));
        toast.success("Location details fetched successfully!");
      } else {
        toast.error("Invalid pin code or no data found");
        setDetails((prev) => ({ ...prev, city: "", state: "", locality: "" }));
      }
    } catch (error) {
      toast.error("Failed to fetch location details");
      setDetails((prev) => ({ ...prev, city: "", state: "", locality: "" }));
    } finally {
      setRegLoading(false);
    }
  };

  const handlePinCodeChange = (e) => {
    const pinCode = e.target.value;
    setDetails({ ...details, areaPin: pinCode });
    if (pinCode.length === 6 && !otpSent) {
      fetchLocationDetails(pinCode);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!details.fullName || !details.phoneNumber || !details.areaPin || !details.locality || !details.city || !details.state) {
      toast.error("All fields are required");
      return;
    }

    setRegLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/register`,
        {
          fullName: details.fullName,
          phoneNumber: details.phoneNumber,
          countryCode: details.countryCode,
          areaPin: details.areaPin,
          locality: details.locality,
          city: details.city,
          state: details.state,
        },
        { withCredentials: true }
      );

      setOrderId(res.data.orderId);
      setOtpSent(true);
      setResendCooldown(120);
      toast.success("Phone OTP sent successfully!");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send phone OTP";
      toast.error(errorMessage);
      if (errorMessage === "Phone number is already registered") {
        setOtpSent(false);
      }
    } finally {
      setRegLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    setRegLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/verify-phone`,
        { phoneNumber: details.phoneNumber, countryCode: details.countryCode, otp: phoneOtp, orderId },
        { withCredentials: true }
      );

      const phoneAuth = res.data.phoneAuth;
      const expirationDate = new Date(Date.now() + 5 * 60 * 1000);
      cookies.set("phoneAuth", phoneAuth, { expires: expirationDate, path: "/" });

      setIsPhoneVerified(true);
      setPhoneOtp("");
      setOtpSent(false);
      setStep(1);
      toast.success("Phone verified successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid phone OTP");
    } finally {
      setRegLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!details.email || !isEmailValid || !details.password || !isPasswordValid) {
      toast.error("Valid email and password are required");
      return;
    }

    setRegLoading(true);
    try {
      const phoneAuth = cookies.get("phoneAuth");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/send-email-otp`,
        {
          email: details.email,
          password: details.password,
          phoneNumber: details.phoneNumber,
          countryCode: details.countryCode,
        },
        { headers: { "phoneAuth": phoneAuth }, withCredentials: true }
      );

      setEmailOtpSent(true);
      setResendCooldown(120);
      toast.success("Email OTP sent successfully!");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send email OTP";
      toast.error(errorMessage);
      if (errorMessage === "Email is already registered") {
        setEmailOtp("");
      }
    } finally {
      setRegLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setRegLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/verify-email`,
        { email: details.email, otp: emailOtp },
        { withCredentials: true }
      );

      const { access_token, refresh_token, access_token_exp } = res.data;
      const expirationDate = new Date(access_token_exp * 1000);
      cookies.set("auth", access_token, { expires: expirationDate, path: "/" });
      cookies.set("refreshToken", refresh_token, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), path: "/" });
      localStorage.clear(); // Clear any old tokens to prevent interference
      toast.success("Registered successfully!");
      router.push("/account/login");
      console.log("Redirecting to /account/login"); // Debugging
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid email OTP");
    } finally {
      setRegLoading(false);
    }
  };

  const passwordCriteria = {
    length: { test: (p) => p.length >= 8, message: "At least 8 characters" },
    uppercase: { test: (p) => /[A-Z]/.test(p), message: "At least one uppercase letter" },
    number: { test: (p) => /\d/.test(p), message: "At least one number" },
    specialChar: { test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p), message: "At least one special character" },
  };

  const evaluatePasswordStrength = (password) => {
    return Object.keys(passwordCriteria).map((key) => ({
      ...passwordCriteria[key],
      valid: passwordCriteria[key].test(password),
    }));
  };

  const isPasswordStrong = (password) => evaluatePasswordStrength(password).every((criterion) => criterion.valid);

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setDetails({ ...details, password: newPassword });
    const strength = evaluatePasswordStrength(newPassword);
    setPasswordStrength(strength);
    setIsPasswordValid(isPasswordStrong(newPassword));
  };

  const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setDetails({ ...details, email: newEmail });
    setIsEmailValid(isValidEmail(newEmail));
  };

  if (!isHydrated) {
    return (
      <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/landingpage/assests/hero.png"
            layout="fill"
            objectFit="cover"
            alt="Header Background"
            className="absolute inset-0 opacity-90"
          />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center w-full h-full px-6 lg:px-24">
          <div className="text-white max-w-2xl text-center lg:text-left space-y-6 lg:mr-16">
            <h1 className="text-5xl font-bold leading-tight animate-fadeIn">
              Aero2Astro Geospatial Experts Network
            </h1>
            <p className="text-lg opacity-80">
              Collaborate, Contribute & Elevate - Transform Drone Data into Actionable Intelligence.
            </p>
            <button className="mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 transition transform hover:scale-105">
              Join now →
            </button>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-lg p-6 rounded-xl shadow-lg max-w-sm w-[90%] space-y-4 border border-gray-200 lg:ml-16">
            <h2 className="text-center text-2xl font-extrabold text-blue-500">Register as Geospatial</h2>
            <Form className="space-y-3">
              <Input
                required
                size="large"
                placeholder="Full Name*"
                prefix={<UserOutlined className="mx-1 pr-1" />}
              />
              <Input
                size="large"
                addonBefore="+91"
                placeholder="Phone Number*"
                type="tel"
                maxLength={10}
              />
              <Button
                type="primary"
                className="bg-indigo-600 hover:bg-indigo-700 w-full"
                disabled
              >
                Continue
              </Button>
            </Form>
            <p className="text-sm text-white text-center">
              Already a user? <Link href="/account/login" className="text-blue-600 hover:text-blue-700">Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0">
        <Image
          src="/landingpage/assests/hero.png"
          layout="fill"
          objectFit="cover"
          alt="Header Background"
          className="absolute inset-0 opacity-90"
        />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center w-full h-full px-6 lg:px-24">
        <div className="text-white max-w-2xl text-center lg:text-left space-y-6 lg:mr-16">
          <h1 className="text-5xl font-bold leading-tight animate-fadeIn">
            Aero2Astro Geospatial Experts Network
          </h1>
          <p className="text-lg opacity-80">
            Collaborate, Contribute & Elevate - Transform Drone Data into Actionable Intelligence.
          </p>
          <button className="mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 transition transform hover:scale-105">
            Join now →
          </button>
        </div>
        <div className="bg-white bg-opacity-20 backdrop-blur-lg p-6 rounded-xl shadow-lg max-w-sm w-[90%] space-y-4 border border-gray-200 lg:ml-16">
          <h2 className="text-center text-2xl font-extrabold text-blue-500">Register as Geospatial</h2>

          {step === 0 && (
            <Form className="space-y-3">
              <Input
                required
                value={details.fullName}
                onChange={(e) => setDetails({ ...details, fullName: e.target.value })}
                size="large"
                placeholder="Full Name*"
                disabled={otpSent}
                prefix={<UserOutlined className="mx-1 pr-1" />}
              />
              <Input
                size="large"
                addonBefore={details.countryCode}
                value={details.phoneNumber}
                onChange={(e) => setDetails({ ...details, phoneNumber: e.target.value })}
                disabled={otpSent}
                placeholder="Phone Number*"
                type="tel"
                maxLength={10}
              />
              <Input
                size="large"
                value={details.areaPin}
                onChange={handlePinCodeChange}
                disabled={otpSent}
                placeholder="Pin Code*"
                maxLength={6}
              />
              <Input
                size="large"
                value={details.locality}
                onChange={(e) => setDetails({ ...details, locality: e.target.value })}
                disabled={details.areaPin.length === 6 || otpSent}
                placeholder="Locality*"
              />
              <div className="flex gap-4">
                <Input
                  size="large"
                  value={details.city}
                  onChange={(e) => setDetails({ ...details, city: e.target.value })}
                  className="w-full"
                  disabled={details.areaPin.length === 6 || otpSent}
                  placeholder="City*"
                  suffix={<CheckOutlined style={{ color: details.city ? "green" : "transparent" }} />}
                />
                <Input
                  size="large"
                  value={details.state}
                  onChange={(e) => setDetails({ ...details, state: e.target.value })}
                  className="w-full"
                  disabled={details.areaPin.length === 6 || otpSent}
                  placeholder="State*"
                  suffix={<CheckOutlined style={{ color: details.state ? "green" : "transparent" }} />}
                />
              </div>

              {otpSent && (
                <div className="space-y-3">
                  <p className="mb-2 text-white font-semibold">Verify Phone OTP</p>
                  <Input
                    size="large"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    placeholder="Enter Phone OTP"
                    maxLength={6}
                  />
                  <div className="flex justify-between text-sm text-white">
                    <p
                      className={`cursor-pointer ${resendCooldown > 0 && "opacity-50 cursor-not-allowed"}`}
                      onClick={() => resendCooldown === 0 && handleSendPhoneOtp()}
                    >
                      {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend OTP"}
                    </p>
                    <p
                      className="cursor-pointer"
                      onClick={() => {
                        setOtpSent(false);
                        setPhoneOtp("");
                        setResendCooldown(0);
                        setDetails({ ...details, phoneNumber: "" });
                      }}
                    >
                      Change Phone
                    </p>
                  </div>
                  <Button
                    type="primary"
                    className="bg-indigo-600 hover:bg-indigo-700 w-full"
                    onClick={handleVerifyPhoneOtp}
                    disabled={phoneOtp.length !== 6 || regLoading}
                  >
                    {regLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              )}

              {!otpSent && (
                <Button
                  type="primary"
                  className="bg-indigo-600 hover:bg-indigo-700 w-full"
                  onClick={handleSendPhoneOtp}
                  disabled={regLoading}
                >
                  {regLoading ? "Sending OTP..." : "Continue"}
                </Button>
              )}
            </Form>
          )}

          {step === 1 && (
            <Form className="space-y-3">
              <Input
                disabled
                size="large"
                addonBefore={details.countryCode}
                value={details.phoneNumber}
                placeholder="Phone Number"
              />
              <Input
                size="large"
                value={details.email}
                onChange={handleEmailChange}
                className={isEmailValid ? "" : "border-red-500"}
                placeholder="Email*"
                disabled={emailOtpSent}
                prefix={<MailOutlined className="mx-1" />}
              />
              {!isEmailValid && (
                <p style={{ color: "red" }} className="text-xs">
                  Please enter a valid email address
                </p>
              )}
              <Input.Password
                size="large"
                value={details.password}
                onChange={handlePasswordChange}
                placeholder="Password*"
                disabled={emailOtpSent}
                prefix={<KeyOutlined className="mx-1" />}
              />
              {!isPasswordValid && !emailOtpSent && (
                <div>
                  {passwordStrength.map((criterion, index) => (
                    <p key={index} className="text-xs" style={{ color: criterion.valid ? "green" : "red" }}>
                      {criterion.message}
                    </p>
                  ))}
                </div>
              )}

              {emailOtpSent && (
                <div className="space-y-3">
                  <p className="mb-2 text-white font-semibold">Verify Email OTP</p>
                  <Input
                    size="large"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    placeholder="Enter Email OTP"
                    maxLength={4}
                  />
                  <div className="flex justify-between text-sm text-white">
                    <p
                      className={`cursor-pointer ${resendCooldown > 0 && "opacity-50 cursor-not-allowed"}`}
                      onClick={() => resendCooldown === 0 && handleSendEmailOtp()}
                    >
                      {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend OTP"}
                    </p>
                    <p
                      className="cursor-pointer"
                      onClick={() => {
                        setEmailOtpSent(false);
                        setEmailOtp("");
                        setResendCooldown(0);
                        setDetails({ ...details, email: "", password: "" });
                      }}
                    >
                      Change Email
                    </p>
                  </div>
                  <Button
                    type="primary"
                    className="bg-indigo-600 hover:bg-indigo-700 w-full"
                    onClick={handleVerifyEmailOtp}
                    disabled={emailOtp.length !== 4 || regLoading}
                  >
                    {regLoading ? "Verifying..." : "Verify & Register"}
                  </Button>
                </div>
              )}

              {!emailOtpSent && (
                <Button
                  type="primary"
                  className="bg-indigo-600 hover:bg-indigo-700 w-full"
                  onClick={handleSendEmailOtp}
                  disabled={!isEmailValid || !isPasswordValid || regLoading}
                >
                  {regLoading ? "Sending OTP..." : "Continue"}
                </Button>
              )}
            </Form>
          )}

          <p className="text-sm text-white text-center">
            Already a user? <Link href="/account/login" className="text-blue-600 hover:text-blue-700">Login</Link>
          </p>
        </div>
      </div>
      {regLoading && (
        <div className="absolute inset-0 h-full opacity-50 bg-black z-40 text-white flex items-center justify-center">
          <Spin size="large" />
        </div>
      )}
    </div>
  );
}