import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterExecutive } from "../../hooks/useAuth";
import { useGetAllAirlines } from "../../hooks/useGeneral";
import { toast } from "sonner";

const InputField = ({
  label,
  name,
  value,
  formData,
  handleChange,
  handleBlur,
  errors,
  touched,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  type = "text",
  placeholder,
  isSelect = false,
  options = [],
  isLoading = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      {isSelect ? (
        <select
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLoading}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
            errors[name] && touched[name]
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-[var(--primary-color)] focus:border-transparent"
          }`}
        >
          <option value="">Select Airline</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.airlineName}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
            errors[name] && touched[name]
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-[var(--primary-color)] focus:border-transparent"
          }`}
        />
      )}

      {(name === "password" || name === "confirmPassword") && (
        <button
          type="button"
          onClick={() =>
            name === "password"
              ? setShowPassword(!showPassword)
              : setShowConfirmPassword(!showConfirmPassword)
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {(name === "password" ? showPassword : showConfirmPassword) ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      )}
    </div>
    {errors[name] && touched[name] && (
      <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
    )}
  </div>
);

const ExecutiveSignup = () => {
  const navigate = useNavigate();
  const { mutate: registerExecutive, isPending: isRegistering } =
    useRegisterExecutive();
  const { data: airlinesData, isLoading: isLoadingAirlines } =
    useGetAllAirlines();

  const airlines = airlinesData?.data || [];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phoneNumber: "",
    idNumber: "",
    airlineId: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    if (!value && name !== "middleName")
      return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1")} is required`;

    if (name === "email") {
      if (!/^\S+@\S+\.\S+$/.test(value)) return "Enter a valid email address";
    }

    if (name === "password") {
      if (value.length < 8) return "Password must be at least 8 characters";
    }

    if (name === "confirmPassword") {
      if (value !== formData.password) return "Passwords do not match";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(formData).reduce(
        (acc, last) => ({ ...acc, [last]: true }),
        {},
      ),
    );

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const { confirmPassword, ...payload } = formData;

    registerExecutive(payload, {
      onSuccess: () => {
        toast.success("Executive registered successfully!");
        navigate(`/executive-login?airlineId=${payload.airlineId}`);
      },
      onError: (error) => {
        const message =
          error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.message ||
          "Registration failed. Please try again.";
        toast.error(message);
      },
    });
  };

  const inputProps = {
    formData,
    handleChange,
    handleBlur,
    errors,
    touched,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  };

  return (
    <div className="min-h-screen w-full py-8 bg-[url('/images/loginbg.png')] bg-fixed bg-cover bg-center flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8  overflow-y-auto custom-scrollbar">
        <div className="flex justify-center mb-8">
          <img src="/icons/logo.svg" alt="logo" className="h-14" />
        </div>

        <h1 className="text-2xl font-semibold text-left text-gray-800 mb-6">
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              placeholder="John"
              {...inputProps}
            />
            <InputField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              placeholder="Doe"
              {...inputProps}
            />
          </div>

          <InputField
            label="Middle Name (Optional)"
            name="middleName"
            value={formData.middleName}
            placeholder="Owolabi"
            {...inputProps}
          />
          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            placeholder="you@example.com"
            {...inputProps}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              placeholder="+123 456 7890"
              {...inputProps}
            />
            <InputField
              label="ID Number"
              name="idNumber"
              value={formData.idNumber}
              placeholder="ID-12345"
              {...inputProps}
            />
          </div>

          <InputField
            label="Airline"
            name="airlineId"
            value={formData.airlineId}
            isSelect={true}
            options={airlines}
            isLoading={isLoadingAirlines}
            {...inputProps}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              placeholder="••••••••"
              {...inputProps}
            />
            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              placeholder="••••••••"
              {...inputProps}
            />
          </div>

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full py-4 bg-[#3DA5E0] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isRegistering ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-8">
          Already have an account?{" "}
          <Link
            to="/executive-login"
            className="font-medium text-[var(--primary-color)] hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ExecutiveSignup;
