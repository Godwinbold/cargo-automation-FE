import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { LOGIN_NAME_CONFIGS } from "../../constants/configFile";

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const nameSlug = searchParams.get("name") || "codiv";
  const config = LOGIN_NAME_CONFIGS[nameSlug];

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen">
        Invalid name. <a href="/partners">Go back</a>
      </div>
    );
  }

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isLoading, setIsLoading] = useState(false);

  // Validate single field
  const validateField = (name, value) => {
    let error = "";

    if (name === "email") {
      if (!value) error = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(value)) error = "Invalid email format";
    }

    if (name === "password") {
      if (!value) error = "Password is required";
      else if (value.length < 8)
        error = "Password must be at least 8 characters";
    }

    return error;
  };

  // Validate all fields and return errors object
  const validateForm = () => {
    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);

    const newErrors = { email: emailError, password: passwordError };
    setErrors(newErrors);
    return newErrors;
  };

  // Real-time validation on change + blur
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Only show error if field has been touched
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Validate everything
    const currentErrors = validateForm();

    // Check if any error exists
    const hasErrors = Object.values(currentErrors).some((err) => err !== "");
    if (hasErrors) {
      return; // Stop submission
    }

    // Simulate login success
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Login successful! Redirecting to ${config.redirectTo}`);
      window.location.href = config.redirectTo;
    }, 1200);
  };

  // Optional: Disable button if form is invalid or empty
  const isFormValid =
    formData.email && formData.password && !errors.email && !errors.password;

  return (
    <div
      className="h-screen w-full bg-[url('/images/loginbg.png')] bg-cover bg-center flex items-center justify-center p-2 md:p-4"
      style={{ "--primary-color": config.primaryColor }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 md:p-8 relative z-10">
        <div className="flex justify-center mb-6">
          <img
            src={config.logoSrc}
            alt={`${nameSlug} Cargo`}
            className="h-12 w-auto"
          />
        </div>

        <h1 className="text-2xl font-semibold text-left text-gray-800 mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-left text-gray-600 mb-6">
          Login to your account to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter email address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter email address"
              className={`w-full px-3 h-[48px] py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                errors.email && touched.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-[var(--primary-color)]"
              }`}
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Password"
                className={`w-full px-3 h-[48px] py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.password && touched.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[var(--primary-color)]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex justify-between items-center text-sm">
            <Link
              to={config.forgotPasswordLink}
              className="text-gray-600 hover:text-[var(--primary-color)] transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full py-3 bg-[var(--primary-color)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <a
            href={config.signupLink}
            className="text-[var(--primary-color)] font-medium hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
