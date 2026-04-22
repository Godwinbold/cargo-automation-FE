import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { PORTAL_CONFIGS } from "../../constants/configFile";
import authApi from "../../api/auth";

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const nameSlug = searchParams.get("name") || "default";
  const airlineId = searchParams.get("airlineId") || "";
  const config = PORTAL_CONFIGS[nameSlug];

  const loginUrl = config?.loginLink
    ? `${config.loginLink}${airlineId ? `&airlineId=${airlineId}` : ""}`
    : "/login";

  // ── State ─────────────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen">
        Invalid portal.{" "}
        <a href="/" className="text-blue-600 underline ml-1">
          Go back
        </a>
      </div>
    );
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!email) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Invalid email format";

    if (!newPassword) errs.newPassword = "New password is required";
    else if (newPassword.length < 8)
      errs.newPassword = "Must be at least 8 characters";

    if (confirmPassword !== newPassword)
      errs.confirmPassword = "Passwords do not match";

    return errs;
  };

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const clearMessages = () => {
    setApiError("");
    setSuccessMsg("");
  };

  // ── Step 3: Reset Password ────────────────────────────────────────────────
  const { mutate: resetPassword, isPending: isResetting } = useMutation({
    mutationFn: () => {
      // Automatically pull token from localStorage as requested
      const token =
        localStorage.getItem("reset_token") ||
        localStorage.getItem("access_token") ||
        "";

      return authApi.forgotPassword({
        email,
        newPassword,
        token: JSON.parse(token),
      });
    },
    onSuccess: () => {
      setSuccessMsg("Password reset successfully! Redirecting to login…");
      setTimeout(() => {
        navigate(loginUrl);
      }, 2000);
    },
    onError: (err) => {
      setApiError(
        err?.response?.data?.message ||
          "Failed to reset password. Please check your credentials or token.",
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentErrors = validate();
    setErrors(currentErrors);
    setTouched({ email: true, newPassword: true, confirmPassword: true });

    if (Object.keys(currentErrors).length > 0) return;

    clearMessages();
    resetPassword();
  };

  // ── Shared banner ─────────────────────────────────────────────────────────
  const Banner = () => (
    <>
      {successMsg && (
        <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          <CheckCircle size={15} className="shrink-0" />
          {successMsg}
        </div>
      )}
      {apiError && (
        <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <XCircle size={15} className="shrink-0" />
          {apiError}
        </div>
      )}
    </>
  );

  return (
    <div
      className="h-screen w-full bg-[url('/images/loginbg.png')] bg-cover bg-center flex items-center justify-center p-4"
      style={{ "--primary-color": config.primaryColor }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={config.logoSrc} alt={nameSlug} className="h-14" />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Forgot Password?
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Please enter your email and your new password.
        </p>

        <Banner />

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearMessages();
              }}
              onBlur={() => handleBlur("email")}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                errors.email && touched.email
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-200 focus:ring-[var(--primary-color)]"
              }`}
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  clearMessages();
                }}
                onBlur={() => handleBlur("newPassword")}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                  errors.newPassword && touched.newPassword
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-200 focus:ring-[var(--primary-color)]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && touched.newPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearMessages();
                }}
                onBlur={() => handleBlur("confirmPassword")}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                  errors.confirmPassword && touched.confirmPassword
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-200 focus:ring-[var(--primary-color)]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
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
            disabled={isResetting || !!successMsg}
            className="w-full py-3.5 bg-[var(--primary-color)] text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all text-sm"
          >
            {isResetting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Resetting…
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remembered it?{" "}
          <a
            href={loginUrl}
            className="font-medium text-[var(--primary-color)] hover:underline"
          >
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
