/**
 * Format a shipment ID (UUID or numeric) into a user-friendly code like "S00000001".
 * Uses a deterministic 32-bit FNV-1a hash for UUIDs to guarantee consistency
 * across all tables, cards, filters, and searches.
 */
export const formatShipmentId = (id) => {
  if (!id) return "N/A";
  const str = String(id).trim();

  // If already formatted like S00000001
  if (/^S\d{6,}$/i.test(str)) {
    return str.toUpperCase();
  }

  // If small sequential integer (e.g. 1, 42)
  if (!isNaN(str) && Number.isInteger(Number(str))) {
    return `S${Number(str).toString().padStart(8, "0")}`;
  }

  // For UUIDs or alphanumeric strings:
  // Deterministic 32-bit FNV-1a hash mapped into an 8-digit string
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const positiveNum = (Math.abs(hash) % 90000000) + 10000000;
  return `S${positiveNum}`;
};

/**
 * Format a number as currency with commas and 2 decimal places: e.g. "2,000.00"
 */
export const formatCurrencyValue = (val) => {
  if (val === null || val === undefined || val === "") return "";
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ""));
  if (Number.isNaN(num)) return String(val);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format a number with Naira currency symbol: e.g. "₦2,000.00"
 */
export const formatNaira = (val) => {
  if (val === null || val === undefined || val === "") return "₦0.00";
  const formatted = formatCurrencyValue(val);
  return formatted ? `₦${formatted}` : "₦0.00";
};

/**
 * Clean a formatted monetary string into a raw float number for backend submissions:
 * e.g. "2,000.00" -> 2000
 */
export const parseFormattedNumber = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  const cleaned = String(val).replace(/,/g, "").trim();
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
};
