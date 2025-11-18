import { redirect } from "react-router-dom";

export const name_CONFIGS = {
  turkish: {
    logoSrc: "/icons/turkish.svg",
    primaryColor: "#ED2939",
    endpoint: "/api/register/turkish",
    verifyEndpoint: "/api/verify-otp/turkish",
    resendEndpoint: "/api/resend-otp/turkish",
    loginLink: "/login?name=turkish",
  },
  rwandair: {
    logoSrc: "/icons/rwandair.svg",
    primaryColor: "#FDB927",
    endpoint: "/api/register/rwandair",
    verifyEndpoint: "/api/verify-otp/rwandair",
    resendEndpoint: "/api/resend-otp/rwandair",
    loginLink: "/login?name=rwandair",
  },
  united: {
    logoSrc: "/icons/united.svg",
    primaryColor: "#005187",
    endpoint: "/api/register/united",
    verifyEndpoint: "/api/verify-otp/united",
    resendEndpoint: "/api/resend-otp/united",
    loginLink: "/login?name=united",
  },
  southafrica: {
    logoSrc: "/icons/south-africa.svg",
    primaryColor: "#005566",
    endpoint: "/api/register/southafrica",
    verifyEndpoint: "/api/verify-otp/southafrica",
    resendEndpoint: "/api/resend-otp/southafrica",
    loginLink: "/login?name=southafrica",
  },
  codiv: {
    logoSrc: "/icons/codiv.svg",
    primaryColor: "#00843D",
    endpoint: "/api/register/codiv",
    verifyEndpoint: "/api/verify-otp/codiv",
    resendEndpoint: "/api/resend-otp/codiv",
    loginLink: "/login?name=codiv",
  },
};

export const PORTAL_CONFIGS = {
  turkish: {
    logoSrc: "/icons/turkish.svg",
    primaryColor: "#ED2939",
    endpoint: "/api/forgot-password/turkish",
    loginLink: "/login?name=turkish",
  },
  rwandair: {
    logoSrc: "/icons/rwandair.svg",
    primaryColor: "#FDB927",
    endpoint: "/api/forgot-password/rwandair",
    loginLink: "/login?name=rwandair",
  },
  united: {
    logoSrc: "/icons/united.svg",
    primaryColor: "#005187",
    endpoint: "/api/forgot-password/united",
    loginLink: "/login?name=united",
  },
  southafrica: {
    logoSrc: "/icons/south-africa.svg",
    primaryColor: "#005566",
    endpoint: "/api/forgot-password/southafrica",
    loginLink: "/login?name=southafrica",
  },
  codiv: {
    logoSrc: "/icons/codiv.svg",
    primaryColor: "#00843D",
    endpoint: "/api/forgot-password/codiv",
    loginLink: "/login?name=codiv",
  },
};

export const LOGIN_NAME_CONFIGS = {
  turkish: {
    logoSrc: "/icons/turkish.svg",
    primaryColor: "#ED2939",
    endpoint: "/api/login/turkish",
    signupLink: "/register?name=turkish",
    forgotPasswordLink: "/forgot-password?name=turkish",
    redirectTo: "/turkish-dashboard",
  },
  rwandair: {
    logoSrc: "/icons/rwandair.svg",
    primaryColor: "#FDB927",
    endpoint: "/api/login/rwandair",
    signupLink: "/register?name=rwandair",
    forgotPasswordLink: "/forgot-password?name=rwandair",
    redirectTo: "/rwanda-dashboard",
  },
  united: {
    logoSrc: "/icons/united.svg",
    primaryColor: "#005187",
    endpoint: "/api/login/united",
    signupLink: "/register?name=united",
    forgotPasswordLink: "/forgot-password?name=united",
    redirectTo: "/united-dashboard",
  },
  southafrica: {
    logoSrc: "/icons/south-africa.svg",
    primaryColor: "#005566",
    endpoint: "/api/login/southafrica",
    signupLink: "/register?name=southafrica",
    forgotPasswordLink: "/forgot-password?name=southafrica",
    redirectTo: "/south-africa-dashboard",
  },
  codiv: {
    logoSrc: "/icons/codiv.svg",
    primaryColor: "#00843D",
    endpoint: "/api/login/codiv",
    signupLink: "/register?name=codiv",
    forgotPasswordLink: "/forgot-password?name=codiv",
    redirectTo: "/cotedivoire-dashboard",
  },
};
