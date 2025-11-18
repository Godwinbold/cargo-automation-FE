import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { name_CONFIGS } from "../../constants/configFile";

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const nameSlug = searchParams.get("name") || "codiv";
  const config = name_CONFIGS[nameSlug];

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen">
        Invalid name. <a href="/partners">Go back</a>
      </div>
    );
  }

  const [step, setStep] = useState("form"); // "form" | "otp"
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Validate single field
  const validateField = (name, value) => {
    let error = "";

    if (name === "email") {
      if (!value) error = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(value))
        error = "Please enter a valid email address";
    }

    if (name === "password") {
      if (!value) error = "Password is required";
      else if (value.length < 8)
        error = "Password must be at least 8 characters";
    }

    if (name === "confirmPassword") {
      if (!value) error = "Please confirm your password";
      else if (value !== formData.password) error = "Passwords do not match";
    }

    return error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      confirmPassword: validateField(
        "confirmPassword",
        formData.confirmPassword
      ),
    };
    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formData[name]),
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    setTouched({ email: true, password: true, confirmPassword: true });
    const currentErrors = validateForm();

    const hasErrors = Object.values(currentErrors).some((err) => err !== "");
    if (hasErrors) return;

    // Simulate registration success → go to OTP step
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      alert("Registration successful! Check your email for OTP.");
    }, 1200);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));

    // Auto-focus next box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsVerifying(true);

    // Simulate OTP verification
    setTimeout(() => {
      setIsVerifying(false);

      if (otp === "123456") {
        alert("Account verified successfully!");
        // Redirect to config-defined login/dashboard
        window.location.href = config.loginLink;
      } else {
        alert("Invalid OTP. Try 123456 for demo.");
        setOtp("");
      }
    }, 1500);
  };

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setOtp("");
      alert("New OTP sent! (Use 123456)");
    }, 1000);
  };

  const isFormValid =
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;

  // OTP Step
  if (step === "otp") {
    return (
      <div
        className="h-screen w-full bg-[url('/images/loginbg.png')] bg-cover bg-center flex items-center justify-center p-4"
        style={{ "--primary-color": config.primaryColor }}
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-8">
            <img src={config.logoSrc} alt={nameSlug} className="h-14" />
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-800 mb-3">
            Verify Your Email
          </h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            We sent a 6-digit code to
          </p>
          <p className="text-center font-semibold text-gray-800 mb-8">
            {formData.email}
          </p>

          <form onSubmit={handleOtpSubmit} className="space-y-6">
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
                  className="w-12 h-12 text-2xl font-bold text-center border-2 rounded-xl focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                  style={{
                    borderColor: otp[i] ? "var(--primary-color)" : "#e5e7eb",
                  }}
                />
              ))}
            </div>

            {otp.length !== 6 && otp.length > 0 && (
              <p className="text-xs text-red-600 text-center">
                Enter all 6 digits
              </p>
            )}

            <button
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              className="w-full py-4 bg-[var(--primary-color)] text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isVerifying ? <>Verifying...</> : "Verify & Continue"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Didn't receive it?{" "}
              <button
                onClick={handleResend}
                disabled={isResending}
                className="font-medium text-[var(--primary-color)] hover:underline"
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </button>
            </p>
            <button
              onClick={() => setStep("form")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form Step
  return (
    <div
      className="h-screen w-full py-4 bg-[url('/images/loginbg.png')] bg-cover bg-center flex items-center justify-center p-4"
      style={{ "--primary-color": config.primaryColor }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-8">
          <img src={config.logoSrc} alt={nameSlug} className="h-14" />
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Account
        </h1>
        <p className="text-center text-gray-600 mb-8">Join us today</p>

        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.email && touched.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-[var(--primary-color)] focus:border-transparent"
              }`}
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.password && touched.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[var(--primary-color)] focus:border-transparent"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.confirmPassword && touched.confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[var(--primary-color)] focus:border-transparent"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
            disabled={isLoading || !isFormValid}
            className="w-full py-4 bg-[var(--primary-color)] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-8">
          Already have an account?{" "}
          <a
            href={config.loginLink}
            className="font-medium text-[var(--primary-color)] hover:underline"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
