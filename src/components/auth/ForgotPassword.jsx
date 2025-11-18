import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PORTAL_CONFIGS } from "../../constants/configFile";

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const nameSlug = searchParams.get("name") || "default";
  const config = PORTAL_CONFIGS[nameSlug];

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen">
        Invalid portal. <a href="/partners">Go back</a>
      </div>
    );
  }

  const [step, setStep] = useState("email"); // "email" | "otp" | "reset"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const validateEmail = (value) =>
    !value
      ? "Email is required"
      : !/^\S+@\S+\.\S+$/.test(value)
      ? "Invalid email format"
      : "";

  const validatePassword = (value) =>
    !value
      ? "Password is required"
      : value.length < 8
      ? "Password must be at least 8 characters"
      : "";

  const validateConfirm = (value) =>
    value !== newPassword ? "Passwords do not match" : "";

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // Step 1: Send OTP
  const handleSendOtp = (e) => {
    e.preventDefault();
    const error = validateEmail(email);
    setErrors({ email: error });
    if (error) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      alert(`OTP sent to ${email}\n\nUse: 123456 (demo)`);
    }, 1200);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: "Enter full 6-digit code" }));
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (otp === "123456") {
        setStep("reset");
        setOtp(""); // clear
      } else {
        setErrors((prev) => ({ ...prev, otp: "Invalid OTP. Use 123456" }));
        setOtp("");
      }
    }, 1200);
  };

  // Step 3: Reset Password
  const handleResetPassword = (e) => {
    e.preventDefault();

    const passError = validatePassword(newPassword);
    const confirmError = validateConfirm(confirmPassword);

    setErrors({ newPassword: passError, confirmPassword: confirmError });
    setTouched({ newPassword: true, confirmPassword: true });

    if (passError || confirmError) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Password changed successfully!");
      window.location.href = config.loginLink || "/login";
    }, 1200);
  };

  // OTP Input Handler
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join("").slice(0, 6));

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div
      className="h-screen w-full bg-[url('/images/loginbg.png')] bg-cover bg-center flex items-center justify-center p-4"
      style={{ "--primary-color": config.primaryColor }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-8">
          <img src={config.logoSrc} alt={nameSlug} className="h-14" />
        </div>

        {/* STEP 1: Enter Email */}
        {step === "email" && (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-3">
              Forgot Password?
            </h1>
            <p className="text-center text-gray-600 mb-8 text-sm">
              Enter your email address and we'll send you a code to reset your
              password
            </p>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.email && touched.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[var(--primary-color)]"
                  }`}
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[var(--primary-color)] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isLoading ? "Sending Code..." : "Send Code"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-8">
              Remembered your password?{" "}
              <a
                href={config.loginLink}
                className="font-medium text-[var(--primary-color)] hover:underline"
              >
                Back to Login
              </a>
            </p>
          </>
        )}

        {/* STEP 2: Enter OTP */}
        {step === "otp" && (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-3">
              Enter Verification Code
            </h1>
            <p className="text-center text-gray-600 mb-2 text-sm">
              We sent a 6-digit code to
            </p>
            <p className="text-center font-semibold text-gray-800 mb-8">
              {email}
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="flex justify-center gap-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={otp[i] || ""}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className="w-14 h-14 text-2xl font-bold text-center border-2 rounded-xl focus:outline-none focus:border-[var(--primary-color)] transition-all"
                    style={{
                      borderColor: otp[i] ? "var(--primary-color)" : "#e5e7eb",
                    }}
                  />
                ))}
              </div>

              {errors.otp && (
                <p className="text-center text-xs text-red-600">{errors.otp}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-4 bg-[var(--primary-color)] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Didn't receive it?{" "}
              <button
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    alert("New code sent! Use 123456");
                  }, 1000);
                }}
                disabled={isLoading}
                className="font-medium text-[var(--primary-color)] hover:underline"
              >
                Resend Code
              </button>
            </p>
          </>
        )}

        {/* STEP 3: Reset Password */}
        {step === "reset" && (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-3">
              Set New Password
            </h1>
            <p className="text-center text-gray-600 mb-8 text-sm">
              Your new password must be different from previous ones
            </p>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={() => handleBlur("newPassword")}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.newPassword && touched.newPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-[var(--primary-color)]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.newPassword && touched.newPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-[var(--primary-color)]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[var(--primary-color)] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isLoading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
