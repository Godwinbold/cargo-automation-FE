import React, { useState, useEffect, useMemo } from "react";
import { Eye, EyeOff, ArrowLeft, ArrowRight, ShieldAlert } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { LOGIN_NAME_CONFIGS } from "../../constants/configFile";
import { useLoginAirlineUser } from "../../hooks/useAuth";
import { useGetAllAirlines } from "../../hooks/useGeneral";
import airlineMetadata from "../landing/AirlineMetadata";
import AirlineSelection from "./AirlineSelection";
import { toast } from "sonner";
import { SaveToLocalStorage } from "../../utils/getFromLocals";
import { useAuthContext } from "../../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuthContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resolvedSlug, setResolvedSlug] = useState("");
  const nameFromUrl = searchParams.get("name") || "";
  const airlineId = searchParams.get("airlineId") || "";
  const nameSlug = nameFromUrl || resolvedSlug;

  const { data: airlinesData, isLoading: isLoadingAirlines } =
    useGetAllAirlines({
      enabled: (!nameFromUrl && !!airlineId) || (!nameFromUrl && !airlineId),
    });

  useEffect(() => {
    if (!nameFromUrl) {
      if (airlineId && airlinesData?.data) {
        const currentAirline = airlinesData.data.find(
          (a) => a.id === airlineId,
        );
        if (currentAirline) {
          const metadata = airlineMetadata[currentAirline.airlineName] || {
            slug: currentAirline.airlineName.toLowerCase().replace(/\s+/g, ""),
          };
          setResolvedSlug(metadata.slug);
        }
      } else if (!airlineId) {
        // Clear resolved slug if we navigate back to base login without params
        setResolvedSlug("");
      }
    }
  }, [searchParams, airlinesData, nameFromUrl, airlineId]);

  // nameSlug is derived above from URL or resolved state

  const { mutate: loginUser, isPending: isLoading } = useLoginAirlineUser();

  useEffect(() => {
    if (airlineId) {
      localStorage.setItem("airlineId", airlineId);
    }
  }, [airlineId]);

  const config = useMemo(() => LOGIN_NAME_CONFIGS[nameSlug], [nameSlug]);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [roleAlert, setRoleAlert] = useState(null);

  if (isLoadingAirlines && !nameSlug) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3DA5E0]"></div>
      </div>
    );
  }

  if (!config) {
    // Show selection screen if we have no airline name and no ID to resolve from
    if (!nameSlug && !airlineId && !isLoadingAirlines && airlinesData?.data) {
      return <AirlineSelection airlines={airlinesData.data} type="login" />;
    }
    // Also show selection if we HAVE an airlineId but are currently loading/resolving it
    if (airlineId && !nameSlug && isLoadingAirlines) {
      return (
        <div className="flex items-center justify-center h-screen tracking-widest text-xs font-bold text-gray-400 uppercase">
          Resolving Airline...
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-screen">
        Invalid partner portal.{" "}
        <a href="/" className="ml-1 text-blue-600 font-bold hover:underline">
          Go back to home
        </a>
      </div>
    );
  }

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

  const validateForm = () => {
    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);

    const newErrors = { email: emailError, password: passwordError };
    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (roleAlert) setRoleAlert(null);

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

    setTouched({ email: true, password: true });
    const currentErrors = validateForm();

    const hasErrors = Object.values(currentErrors).some((err) => err !== "");
    if (hasErrors) return;

    if (!airlineId) {
      toast.error("Airline ID missing. Please return to partners page.");
      return;
    }

    loginUser(
      { airlineId, credentials: formData },
      {
        onSuccess: (response) => {
          const loginData = response?.data;
          const rawRoles = [
            ...(Array.isArray(loginData?.roles) ? loginData.roles : []),
            ...(typeof loginData?.role === "string" ? [loginData.role] : []),
          ].map((r) => String(r).toUpperCase().trim());
          const isAdmin = rawRoles.includes("ADMIN");
          const isExecutive = rawRoles.includes("EXECUTIVE");

          const userDisplayName =
            [loginData?.firstName, loginData?.lastName]
              .filter(Boolean)
              .join(" ") ||
            loginData?.email ||
            formData.email;

          // Flag and reject Admin login attempts on the partner user portal
          if (isAdmin) {
            setRoleAlert({
              type: "admin",
              accountName: userDisplayName,
              accountEmail: loginData?.email || formData.email,
              title: "Administrator Account Detected",
              message:
                "This portal is strictly for partner airline operational staff. Please use the dedicated Admin Portal.",
              actionText: "Go to Admin Portal",
              targetUrl: "/admin-login",
            });
            toast.error(
              "Administrator account detected. Please use the Admin Portal to sign in.",
              {
                id: "role-mismatch-admin",
                duration: 7000,
              },
            );
            return;
          }

          // Flag and reject Executive login attempts on the partner user portal
          if (isExecutive) {
            setRoleAlert({
              type: "executive",
              accountName: userDisplayName,
              accountEmail: loginData?.email || formData.email,
              title: "Executive Account Detected",
              message:
                "You are attempting to sign in with an Executive account. This portal is strictly for partner airline operational staff. Please use the dedicated Executive Portal.",
              actionText: "Go to Executive Portal",
              targetUrl: "/executive-login",
            });
            toast.error(
              "Executive account detected. Please use the Executive Portal to sign in.",
              {
                id: "role-mismatch-exec",
                duration: 7000,
              },
            );
            return;
          }

          toast.success("Login successful!");

          const targetAirlineId = loginData?.airlineId || airlineId;

          // Store token and user data
          if (loginData?.token) {
            SaveToLocalStorage("access_token", loginData.token);
          }
          if (loginData) {
            login(loginData);
            if (loginData.airlineId) {
              localStorage.setItem("airlineId", loginData.airlineId);
            }
            if (loginData.userId) {
              localStorage.setItem("userId", loginData.userId);
            }
          }

          // Explicitly store email for features like change password
          localStorage.setItem("userEmail", formData.email);

          setTimeout(() => {
            navigate(`${config.redirectTo}?airlineId=${targetAirlineId}`);
          }, 1000);
        },
        onError: (error) => {
          const message =
            error.response?.data?.errors?.[0]?.message ||
            error.response?.data?.message ||
            "Invalid credentials";
          toast.error(message);
        },
      },
    );
  };

  const isFormValid =
    formData.email && formData.password && !errors.email && !errors.password;

  return (
    <div
      className="h-screen w-full bg-[url('/images/loginbg.png')] bg-cover bg-center flex items-center justify-center p-2 md:p-4 relative"
      style={{ "--primary-color": config.primaryColor }}
    >
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-all z-50 font-medium text-sm border border-white/20 hover:border-white/40"
      >
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </Link>
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

        {/* Role Mismatch Alert Banner */}
        {roleAlert && (
          <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-bold text-sm text-amber-950">
                    {roleAlert.title}
                  </p>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-semibold text-[10px] tracking-wider uppercase">
                    {roleAlert.type}
                  </span>
                </div>
                {roleAlert.accountName && (
                  <p className="text-xs text-amber-900 font-medium mb-1.5">
                    Account: <span className="font-semibold">{roleAlert.accountName}</span>
                    {roleAlert.accountEmail && roleAlert.accountEmail !== roleAlert.accountName && (
                      <span className="text-amber-700 ml-1">({roleAlert.accountEmail})</span>
                    )}
                  </p>
                )}
                <p className="text-amber-800 leading-relaxed">
                  {roleAlert.message}
                </p>
                <div className="mt-3 flex items-center gap-2.5">
                  <Link
                    to={roleAlert.targetUrl}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold rounded-lg text-xs transition shadow-sm"
                  >
                    <span>{roleAlert.actionText}</span>
                    <ArrowRight size={13} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setRoleAlert(null)}
                    className="px-2.5 py-1.5 text-xs text-amber-800 hover:text-amber-950 font-medium rounded-lg hover:bg-amber-100 transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
              to={`${config.forgotPasswordLink}&airlineId=${airlineId}`}
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
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

       
      </div>
    </div>
  );
};

export default LoginPage;
