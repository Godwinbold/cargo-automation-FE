import React, { useState, useEffect, useMemo } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { name_CONFIGS } from "../../constants/configFile";
import { useRegisterAirlineUser } from "../../hooks/useAuth";
import { useGetAllAirlines } from "../../hooks/useGeneral";
import AirlineSelection from "./AirlineSelection";
import { toast } from "sonner";

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const nameSlug = searchParams.get("name") || "";
  const airlineId = searchParams.get("airlineId");

  const { data: airlinesData, isLoading: isLoadingAirlines } = useGetAllAirlines({
    enabled: (!nameSlug && !!airlineId) || (!nameSlug && !airlineId),
  });

  const { mutate: registerUser, isPending: isLoading } =
    useRegisterAirlineUser();

  useEffect(() => {
    if (airlineId) {
      localStorage.setItem("airlineId", airlineId);
    }
  }, [airlineId]);

  const config = useMemo(() => name_CONFIGS[nameSlug], [nameSlug]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phoneNumber: "",
    idNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  if (isLoadingAirlines && !nameSlug) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3DA5E0]"></div>
      </div>
    );
  }

  if (!config) {
    if (!nameSlug && !airlineId && !isLoadingAirlines && airlinesData?.data) {
      return (
        <AirlineSelection airlines={airlinesData.data} type="register" />
      );
    }
    return (
      <div className="flex items-center justify-center h-screen">
        Invalid partner portal. <a href="/" className="ml-1 text-blue-600 font-bold hover:underline">Go back to home</a>
      </div>
    );
  }

  const validateField = (name, value) => {
    let error = "";

    if (name === "firstName" && !value) error = "First name is required";
    if (name === "lastName" && !value) error = "Last name is required";
    if (name === "idNumber" && !value) error = "ID Number is required";

    if (name === "email") {
      if (!value) error = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(value))
        error = "Please enter a valid email address";
    }

    if (name === "phoneNumber") {
      if (!value) error = "Phone number is required";
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

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
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

    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const currentErrors = validateForm();
    if (Object.keys(currentErrors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (!airlineId) {
      toast.error("Airline ID missing. Please return to partners page.");
      return;
    }

    // Prepare data for API (excluding confirmPassword)
    const { confirmPassword, ...userData } = formData;

    registerUser(
      { airlineId, userData },
      {
        onSuccess: (response) => {
          toast.success("Account created successfully!");
          // Navigation logic here - usually to login or verify email
          setTimeout(() => {
            navigate(`${config.loginLink}&airlineId=${airlineId}`);
          }, 2000);
        },
        onError: (error) => {
          const message =
            error.response?.data?.errors?.[0]?.message ||
            error.response?.data?.message ||
            "Registration failed";
          toast.error(message);
        },
      },
    );
  };

  const isFormValid =
    Object.keys(formData).every((key) => formData[key]) &&
    Object.keys(errors).every((key) => !errors[key]);

  return (
    <div
      className="min-h-screen w-full py-10 bg-[url('/images/loginbg.png')] bg-cover bg-center flex items-center justify-center p-4"
      style={{ "--primary-color": config.primaryColor }}
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <img src={config.logoSrc} alt={nameSlug} className="h-14" />
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Account
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Join {config.name} today
        </p>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="John"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.firstName && touched.firstName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[var(--primary-color)]"
                }`}
              />
              {errors.firstName && touched.firstName && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Doe"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.lastName && touched.lastName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[var(--primary-color)]"
                }`}
              />
              {errors.lastName && touched.lastName && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Middle Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name (Optional)
              </label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                placeholder="Owolabi"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              />
            </div>

            {/* ID Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Number
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="12"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.idNumber && touched.idNumber
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[var(--primary-color)]"
                }`}
              />
              {errors.idNumber && touched.idNumber && (
                <p className="mt-1 text-xs text-red-600">{errors.idNumber}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    : "border-gray-300 focus:ring-[var(--primary-color)]"
                }`}
              />
              {errors.email && touched.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="08068482163"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.phoneNumber && touched.phoneNumber
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[var(--primary-color)]"
                }`}
              />
              {errors.phoneNumber && touched.phoneNumber && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      : "border-gray-300 focus:ring-[var(--primary-color)]"
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
                      : "border-gray-300 focus:ring-[var(--primary-color)]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
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
          <Link
            to={`/login?name=${nameSlug}&airlineId=${airlineId}`}
            className="font-medium text-[var(--primary-color)] hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
