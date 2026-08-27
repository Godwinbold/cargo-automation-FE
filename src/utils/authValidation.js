/**
 * Formats and restricts phone number inputs:
 * - Local numbers (do not start with '+'): max 11 digits
 * - International numbers (start with '+'): max 15 characters (+ followed by up to 14 digits)
 * Prevents users from entering characters beyond the applicable limit.
 */
export const formatPhoneNumber = (value) => {
  if (!value) return "";

  const trimmed = value.trim();
  if (trimmed.startsWith("+")) {
    const digitsOnly = trimmed.slice(1).replace(/\D/g, "");
    return ("+" + digitsOnly).slice(0, 15);
  }

  // Local phone number: digits only, max 11 chars
  return trimmed.replace(/\D/g, "").slice(0, 11);
};

/**
 * Validates phone numbers based on local vs international requirements
 */
export const validatePhoneNumber = (value) => {
  if (!value) return "Phone number is required";

  if (value.startsWith("+")) {
    if (value.length < 8 || value.length > 15) {
      return "International phone number must be between 8 and 15 characters";
    }
  } else {
    if (value.length !== 11) {
      return "Local phone number must be 11 digits";
    }
  }

  return "";
};

/**
 * Password validation ensuring consolidated requirement message:
 * "Password must contain at least one alphanumeric character and one special character."
 */
export const PASSWORD_REQUIREMENT_MSG =
  "Password must contain at least one alphanumeric character and one special character.";

export const validatePassword = (value) => {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";

  const hasAlphanumeric = /[a-zA-Z0-9]/.test(value);
  const hasSpecial = /[^a-zA-Z0-9]/.test(value);

  if (!hasAlphanumeric || !hasSpecial) {
    return PASSWORD_REQUIREMENT_MSG;
  }

  return "";
};

/**
 * Extracts and consolidates authentication / API errors.
 * If any backend error is related to password complexity or requirements,
 * returns the single consolidated message.
 */
export const getAuthErrorMessage = (
  error,
  defaultMessage = "An error occurred. Please try again."
) => {
  const isPasswordComplexityError = (msg = "", code = "") => {
    const lower = `${msg} ${code}`.toLowerCase();
    return (
      lower.includes("alphanumeric") ||
      lower.includes("special character") ||
      lower.includes("nonalphanumeric") ||
      lower.includes("non-alphanumeric") ||
      lower.includes("passwordrequires") ||
      lower.includes("password requires") ||
      lower.includes("at least one digit") ||
      lower.includes("at least one uppercase") ||
      lower.includes("at least one lowercase") ||
      lower.includes("at least one special") ||
      lower.includes("at least one non alphanumeric") ||
      lower.includes("passwords must have at least") ||
      lower.includes("password must have at least") ||
      lower.includes("password must contain")
    );
  };

  const errorsList = error?.response?.data?.errors;
  const responseMsg = error?.response?.data?.message || error?.message;

  if (Array.isArray(errorsList) && errorsList.length > 0) {
    const hasPassErr = errorsList.some((err) => {
      const msg = typeof err === "string" ? err : err?.message || err?.description || "";
      const code = typeof err === "object" ? err?.code || "" : "";
      return isPasswordComplexityError(msg, code);
    });

    if (hasPassErr) {
      return PASSWORD_REQUIREMENT_MSG;
    }

    const firstErr = errorsList[0];
    return typeof firstErr === "string"
      ? firstErr
      : firstErr?.message || firstErr?.description || defaultMessage;
  }

  if (responseMsg && isPasswordComplexityError(responseMsg)) {
    return PASSWORD_REQUIREMENT_MSG;
  }

  return responseMsg || defaultMessage;
};
