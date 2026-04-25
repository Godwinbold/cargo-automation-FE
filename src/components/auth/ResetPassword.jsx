import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle, XCircle, ArrowLeft, Lock } from "lucide-react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import authApi from "../../api/auth";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  // ── State ─────────────────────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState("");

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!newPassword) errs.newPassword = "New password is required";
    else if (newPassword.length < 8) errs.newPassword = "Password must be at least 8 characters";
    
    if (confirmPassword !== newPassword) errs.confirmPassword = "Passwords do not match";
    
    return errs;
  };

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // ── Mutation ──────────────────────────────────────────────────────────────
  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: (data) => authApi.forgotPassword(data), // Using the same unified endpoint
    onSuccess: () => {
      setIsSuccess(true);
      setApiError("");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    },
    onError: (err) => {
      setApiError(
        err?.response?.data?.message ||
          "Failed to reset password. The link might be expired or invalid.",
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentErrors = validate();
    setErrors(currentErrors);
    setTouched({ newPassword: true, confirmPassword: true });

    if (Object.keys(currentErrors).length > 0) return;

    resetPassword({
      email,
      newPassword,
      token
    });
  };

  if (!email || !token) {
    return (
      <div className="h-screen w-full bg-[url('/images/loginbg.png')] bg-cover bg-center flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-500 text-sm mb-8">This password reset link is missing required information or is invalid.</p>
          <Link to="/login" className="text-blue-600 font-bold text-sm uppercase tracking-widest hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[url('/images/loginbg.png')] bg-cover bg-center flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 p-10 relative overflow-hidden">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
            <img src="/images/logo.svg" alt="logo" className="h-12 object-contain" />
          </div>
        </div>

        {!isSuccess ? (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
                Reset Password
              </h1>
              <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-[280px] mx-auto">
                Set a strong, secure new password for <span className="text-gray-900 font-bold">{email}</span>
              </p>
            </div>

            {apiError && (
              <div className="flex items-center gap-3 mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                <XCircle size={18} className="shrink-0" />
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={() => handleBlur("newPassword")}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-4 bg-gray-50/50 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-medium ${
                      errors.newPassword && touched.newPassword
                        ? "border-red-200 bg-red-50/30"
                        : "border-gray-100 focus:border-blue-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.newPassword && touched.newPassword && (
                  <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-wider px-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-4 bg-gray-50/50 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-medium ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-red-200 bg-red-50/30"
                        : "border-gray-100 focus:border-blue-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-wider px-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-green-100">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Success!</h2>
            <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8 mx-auto">
              Your password has been reset successfully. Redirecting you to login...
            </p>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-green-500 animate-progress-bar" />
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-50 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            Back to Login
          </Link>
        </div>
      </div>
      <style>{`
        @keyframes progress-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress-bar {
          animation: progress-bar 3s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
