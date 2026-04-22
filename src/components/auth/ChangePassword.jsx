import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { PORTAL_CONFIGS } from "../../constants/configFile";
import { useAuthContext } from "../../context/AuthContext";
import authApi from "../../api/auth";

const ChangePasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const nameSlug = searchParams.get("name") || "default";
  const airlineId = searchParams.get("airlineId") || "";
  const config = PORTAL_CONFIGS[nameSlug];

  const loginUrl = config?.loginLink 
    ? `${config.loginLink}${airlineId ? `&airlineId=${airlineId}` : ''}` 
    : "/login";

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700">
        Invalid portal.{" "}
        <a href="/" className="text-blue-600 underline ml-1">
          Go home
        </a>
      </div>
    );
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.oldPassword) errs.oldPassword = "Current password is required";
    if (!form.newPassword) {
      errs.newPassword = "New password is required";
    } else if (form.newPassword.length < 8) {
      errs.newPassword = "Must be at least 8 characters";
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your new password";
    } else if (form.confirmPassword !== form.newPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  const errors = validate();
  const isValid = Object.keys(errors).length === 0;

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMsg("");
    setSuccessMsg("");
  };

  const userEmail = localStorage.getItem("userEmail") || user?.email || "";

  // ── Mutation ──────────────────────────────────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      authApi.changePassword({
        email: userEmail,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      }),
    onSuccess: () => {
      setSuccessMsg("Password changed successfully! Redirecting to login…");
      setTimeout(() => {
        navigate(loginUrl);
      }, 2000);
    },
    onError: (err) => {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to change password. Please try again."
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ oldPassword: true, newPassword: true, confirmPassword: true });
    if (!isValid) return;
    mutate();
  };

  // ── Password strength indicator ──────────────────────────────────────────
  const strengthChecks = [
    { label: "At least 8 characters", ok: form.newPassword.length >= 8 },
    { label: "Contains a number", ok: /\d/.test(form.newPassword) },
    { label: "Contains uppercase", ok: /[A-Z]/.test(form.newPassword) },
    {
      label: "Contains special character",
      ok: /[^A-Za-z0-9]/.test(form.newPassword),
    },
  ];
  const strength = strengthChecks.filter((c) => c.ok).length;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][
    strength
  ];

  const inputClass = (field) =>
    `w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
      errors[field] && touched[field]
        ? "border-red-400 focus:ring-red-300 bg-red-50"
        : "border-gray-200 focus:ring-[var(--primary-color)] bg-white"
    }`;

  return (
    <div
      className="min-h-screen w-full bg-[url('/images/loginbg.png')] bg-cover bg-center flex items-center justify-center p-4"
      style={{ "--primary-color": config.primaryColor }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={config.logoSrc} alt={nameSlug} className="h-14" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Change Password
          </h1>
          <p className="text-sm text-gray-500">
            Update your password to keep your account secure
          </p>
          {userEmail && (
            <span className="inline-block mt-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">
              {userEmail}
            </span>
          )}
        </div>

        {/* Success / Error banners */}
        {successMsg && (
          <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
            <CheckCircle size={16} className="shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <XCircle size={16} className="shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                id="oldPassword"
                type={showOld ? "text" : "password"}
                value={form.oldPassword}
                onChange={(e) => handleChange("oldPassword", e.target.value)}
                onBlur={() => handleBlur("oldPassword")}
                placeholder="Enter current password"
                className={inputClass("oldPassword")}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowOld((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.oldPassword && touched.oldPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.oldPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNew ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) => handleChange("newPassword", e.target.value)}
                onBlur={() => handleBlur("newPassword")}
                placeholder="Enter new password"
                className={inputClass("newPassword")}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && touched.newPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
            )}

            {/* Strength meter */}
            {form.newPassword && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((lvl) => (
                    <div
                      key={lvl}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor:
                          strength >= lvl ? strengthColor : "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
                <p
                  className="text-xs font-medium"
                  style={{ color: strengthColor }}
                >
                  {strengthLabel}
                </p>
              </div>
            )}

            {/* Checklist */}
            {form.newPassword && (
              <ul className="mt-2 space-y-1">
                {strengthChecks.map((c) => (
                  <li
                    key={c.label}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      c.ok ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <CheckCircle size={12} className={c.ok ? "" : "opacity-30"} />
                    {c.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                onBlur={() => handleBlur("confirmPassword")}
                placeholder="Re-enter new password"
                className={inputClass("confirmPassword")}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword}
              </p>
            )}
            {form.confirmPassword &&
              form.confirmPassword === form.newPassword && (
                <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle size={12} /> Passwords match
                </p>
              )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="change-password-submit"
            disabled={isPending || !!successMsg}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: config.primaryColor }}
          >
            {isPending ? (
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
                Updating…
              </span>
            ) : (
              "Update Password"
            )}
          </button>
        </form>

        {/* Back link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          <button
            onClick={() => navigate(-1)}
            className="font-medium hover:underline"
            style={{ color: config.primaryColor }}
          >
            ← Back
          </button>
        </p>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
