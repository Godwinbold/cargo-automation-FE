export const CALCULATED_FINANCIAL_FIELDS = [
  "freightAmountNGN",
  "ncaaCharges5Percent",
  "totalChargeNGN",
  "chargesCollect",
  "vatOnCommission",
  "dueAPGInc",
  "amtDueAirline",
];

const toNum = (value) => {
  const n = parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
};

const toDisplayValue = (value) => {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return String(rounded);
};

export const applyFinancialCalculations = (data) => {
  const chargeableWeightKg = toNum(data.chargeableWeightKg);
  const publishedRates = toNum(data.publishedRates);
  const fuelSurcharge = toNum(data.fuelSurcharge);
  const secSurcharge = toNum(data.secSurcharge);
  const handlingSurcharge = toNum(data.handlingSurcharge);
  const surchargeDueAgent = toNum(data.surchargeDueAgent);
  const awbFee = toNum(data.awbFee);
  const gsaCommissionNGN = toNum(data.gsaCommissionNGN);

  const freightAmountNGN = chargeableWeightKg + publishedRates;
  const ncaaCharges5Percent = freightAmountNGN * 0.05;
  const totalChargeNGN =
    fuelSurcharge +
    secSurcharge +
    handlingSurcharge +
    surchargeDueAgent +
    awbFee;
  const chargesCollect = publishedRates + chargeableWeightKg;
  const vatOnCommission = gsaCommissionNGN * 0.075;
  const dueAPGInc = surchargeDueAgent * 0.3;
  const amtDueAirline =
    freightAmountNGN +
    fuelSurcharge +
    secSurcharge +
    handlingSurcharge -
    gsaCommissionNGN -
    vatOnCommission;

  return {
    ...data,
    freightAmountNGN: toDisplayValue(freightAmountNGN),
    ncaaCharges5Percent: toDisplayValue(ncaaCharges5Percent),
    totalChargeNGN: toDisplayValue(totalChargeNGN),
    chargesCollect: toDisplayValue(chargesCollect),
    vatOnCommission: toDisplayValue(vatOnCommission),
    dueAPGInc: toDisplayValue(dueAPGInc),
    amtDueAirline: toDisplayValue(amtDueAirline),
  };
};
