import React, { useState } from "react";
import { CheckCircle, XCircle, ArrowLeft, Mail } from "lucide-react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState("");

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
    return errs;
  };

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // ── Mutation ──────────────────────────────────────────────────────────────
  const { mutate: requestReset, isPending } = useMutation({
    mutationFn: (data) => authApi.forgotPassword(data),
    onSuccess: () => {
      setIsSubmitted(true);
      setApiError("");
    },
    onError: (err) => {
      setApiError(
        err?.response?.data?.message ||
          "Failed to send reset link. Please verify your email and try again.",
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentErrors = validate();
    setErrors(currentErrors);
    setTouched({ email: true });

    if (Object.keys(currentErrors).length > 0) return;

    requestReset({ email });
  };

  return (
    <div
      className="h-screen w-full bg-[url('/images/loginbg.png')] bg-cover bg-center flex items-center justify-center p-4 font-sans"
      style={{ "--primary-color": config.primaryColor }}
    >
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 p-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--primary-color)] opacity-[0.03] rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--primary-color)] opacity-[0.03] rounded-full blur-3xl" />

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
            <img
              src={config.logoSrc}
              alt={nameSlug}
              className="h-12 object-contain"
            />
          </div>
        </div>

        {!isSubmitted ? (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
                Forgot Password?
              </h1>
              <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-[280px] mx-auto">
                No worries! Enter your email address below and we'll send you a
                link to reset it.
              </p>
            </div>

            {apiError && (
              <div className="flex items-center gap-3 mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                <XCircle size={18} className="shrink-0" />
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="Enter your registered email"
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50/50 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--primary-color)]/10 transition-all text-sm font-medium ${
                      errors.email && touched.email
                        ? "border-red-200 bg-red-50/30"
                        : "border-gray-100 focus:border-[var(--primary-color)]"
                    }`}
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-wider px-1 animate-in fade-in duration-300">
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-[var(--primary-color)] text-white font-bold rounded-2xl shadow-lg shadow-[var(--primary-color)]/20 hover:shadow-[var(--primary-color)]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3"
              >
                {isPending ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-green-100">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
              Check your email
            </h2>
            <p className="text-gray-500 font-medium text-sm leading-relaxed mb-10 max-w-[260px] mx-auto">
              We've sent a password reset link to{" "}
              <span className="text-gray-900 font-bold">{email}</span>. Please
              check your inbox.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-[var(--primary-color)] font-bold text-xs uppercase tracking-widest hover:underline"
            >
              Didn't receive the email? Try again
            </button>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-50 text-center">
          <Link
            to={loginUrl}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[var(--primary-color)] transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
