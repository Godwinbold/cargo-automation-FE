import React, { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Save,
  Loader2,
  DollarSign,
  Calculator,
  Info,
  Lock,
} from "lucide-react";
import { useUpdateFinancial } from "../../hooks/useShipment";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  CALCULATED_FINANCIAL_FIELDS,
  applyFinancialCalculations,
} from "../../utils/financialCalculations";
import { formatCurrencyValue } from "../../utils/shipmentUtils";

const CURRENCY_FIELDS = [
  "spotRate",
  "publishedRates",
  "freightAmountNGN",
  "ncaaCharges5Percent",
  "totalChargeNGN",
  "chargesCollect",
  "fuelSurcharge",
  "secSurcharge",
  "handlingSurcharge",
  "surchargeDueAgent",
  "awbFee",
  "gsaCommissionNGN",
  "vatOnCommission",
  "amtDueAirline",
  "dueAPGInc",
  "dueSLC",
];

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  isCurrency = false,
  unit,
  ...props
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between px-0.5">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
        {label}
      </label>
      {isCurrency && (
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
          NGN (₦)
        </span>
      )}
    </div>
    <div className="relative flex items-center">
      {isCurrency && (
        <span className="absolute left-3.5 font-bold text-gray-500 text-sm select-none pointer-events-none">
          ₦
        </span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder || (isCurrency ? "0.00" : "")}
        disabled={disabled}
        className={`w-full ${
          isCurrency ? "pl-8 pr-4" : unit ? "pl-4 pr-12" : "px-4"
        } py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 ${
          disabled
            ? "bg-gray-100 cursor-not-allowed text-gray-500 opacity-80"
            : ""
        }`}
        {...(type === "number" ? { step: "any" } : {})}
        {...props}
      />
      {unit && (
        <span className="absolute right-3.5 font-medium text-gray-400 text-xs select-none pointer-events-none">
          {unit}
        </span>
      )}
    </div>
  </div>
);

const StepIndicator = ({ active, label, icon: Icon }) => (
  <div className="flex flex-col items-center flex-1 min-w-0">
    <div
      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
        active
          ? "bg-blue-600 text-white shadow-md sm:shadow-lg shadow-blue-100"
          : "bg-gray-100 text-gray-400"
      }`}
    >
      {React.createElement(Icon, { className: "w-4 h-4 sm:w-5 sm:h-5" })}
    </div>
    <span
      className={`text-[9px] sm:text-[10px] font-bold mt-1.5 sm:mt-2 uppercase tracking-tight truncate max-w-[80px] sm:max-w-none text-center ${
        active ? "text-blue-600" : "text-gray-400"
      }`}
    >
      {label}
    </span>
  </div>
);

const isCalculatedField = (name) => CALCULATED_FINANCIAL_FIELDS.includes(name);

const EditFinancialsModal = ({
  isOpen,
  onClose,
  airlineId,
  financialData,
  isViewOnly = false,
  isLocked = false,
  color,
}) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const { mutate: updateFinancial, isPending: isUpdating } =
    useUpdateFinancial();

  const effectiveViewOnly = isViewOnly || isLocked;
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Initialize form with existing data — all 26 fields, formatted monetary values
  useEffect(() => {
    if (isOpen && financialData) {
      const dateOfIssue = financialData.dateOfIssue
        ? new Date(financialData.dateOfIssue).toISOString().split("T")[0]
        : "";

      setFormData(
        applyFinancialCalculations({
          mawb: financialData.mawb || "",
          dateOfIssue,
          agentsOrClients: financialData.agentsOrClients || "",
          product: financialData.product || "",
          routing: financialData.routing || "",
          flightNo: financialData.flightNo || "",
          pieces: String(financialData.pieces ?? ""),
          chargeableWeightKg: String(
            financialData.chargeableWeightKg
              ? financialData.chargeableWeightKg / 1000
              : "",
          ),
          grossWeightKg: String(
            financialData.grossWeightKg
              ? financialData.grossWeightKg / 1000
              : "",
          ),
          spotRate: formatCurrencyValue(financialData.spotRate),
          publishedRates: formatCurrencyValue(financialData.publishedRates),
          roe: String(financialData.roe ?? ""),
          freightAmountNGN: formatCurrencyValue(financialData.freightAmountNGN),
          ncaaCharges5Percent: formatCurrencyValue(financialData.ncaaCharges5Percent),
          totalChargeNGN: formatCurrencyValue(financialData.totalChargeNGN),
          chargesCollect: formatCurrencyValue(financialData.chargesCollect),
          fuelSurcharge: formatCurrencyValue(financialData.fuelSurcharge),
          secSurcharge: formatCurrencyValue(financialData.secSurcharge),
          handlingSurcharge: formatCurrencyValue(financialData.handlingSurcharge),
          surchargeDueAgent: formatCurrencyValue(financialData.surchargeDueAgent),
          awbFee: formatCurrencyValue(financialData.awbFee),
          gsaCommissionNGN: formatCurrencyValue(financialData.gsaCommissionNGN),
          vatOnCommission: formatCurrencyValue(financialData.vatOnCommission),
          amtDueAirline: formatCurrencyValue(financialData.amtDueAirline),
          dueAPGInc: formatCurrencyValue(financialData.dueAPGInc),
          dueSLC: formatCurrencyValue(financialData.dueSLC),
        }),
      );
      setStep(1);
    }
  }, [isOpen, financialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Numeric fields that should only accept numbers, decimal point, and commas
    const numericFields = [
      "pieces", "chargeableWeightKg", "grossWeightKg", "spotRate", "publishedRates", 
      "roe", "freightAmountNGN", "ncaaCharges5Percent", "totalChargeNGN", 
      "chargesCollect", "fuelSurcharge", "secSurcharge", "handlingSurcharge", 
      "surchargeDueAgent", "awbFee", "gsaCommissionNGN", "vatOnCommission", 
      "amtDueAirline", "dueAPGInc", "dueSLC"
    ];

    if (numericFields.includes(name)) {
      if (value !== "" && !/^[\d,]*\.?\d*$/.test(value)) {
        return;
      }
    }

    setFormData((prev) =>
      applyFinancialCalculations({ ...prev, [name]: value }),
    );
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (CURRENCY_FIELDS.includes(name) && value !== "") {
      const num = parseFloat(String(value).replace(/,/g, ""));
      if (!Number.isNaN(num)) {
        const formatted = num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        setFormData((prev) =>
          applyFinancialCalculations({ ...prev, [name]: formatted }),
        );
      }
    }
  };

  const toNum = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    const n = parseFloat(String(v).replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };
  const handleSubmit = () => {
    if (effectiveViewOnly) return;
    // Only send the 26 fields the backend expects — convert strings to numbers here.
    const payload = {
      id: financialData.id,
      shipmentId: financialData.shipmentId,
      mawb: formData.mawb,
      dateOfIssue: formData.dateOfIssue ? new Date(formData.dateOfIssue).toISOString() : null,
      agentsOrClients: formData.agentsOrClients,
      product: formData.product,
      routing: formData.routing,
      flightNo: formData.flightNo,
      pieces: toNum(formData.pieces),
      chargeableWeightKg: toNum(formData.chargeableWeightKg) * 1000,
      grossWeightKg: toNum(formData.grossWeightKg) * 1000,
      spotRate: toNum(formData.spotRate),
      publishedRates: toNum(formData.publishedRates),
      roe: toNum(formData.roe),
      freightAmountNGN: toNum(formData.freightAmountNGN),
      ncaaCharges5Percent: toNum(formData.ncaaCharges5Percent),
      totalChargeNGN: toNum(formData.totalChargeNGN),
      chargesCollect: toNum(formData.chargesCollect),
      fuelSurcharge: toNum(formData.fuelSurcharge),
      secSurcharge: toNum(formData.secSurcharge),
      handlingSurcharge: toNum(formData.handlingSurcharge),
      surchargeDueAgent: toNum(formData.surchargeDueAgent),
      awbFee: toNum(formData.awbFee),
      gsaCommissionNGN: toNum(formData.gsaCommissionNGN),
      vatOnCommission: toNum(formData.vatOnCommission),
      amtDueAirline: toNum(formData.amtDueAirline),
      dueAPGInc: toNum(formData.dueAPGInc),
      dueSLC: toNum(formData.dueSLC),
    };

    updateFinancial(
      {
        airlineId,
        shipmentId: financialData.shipmentId,
        financialId: financialData.id,
        data: payload,
      },
      {
        onSuccess: () => {
          toast.success("Financial records updated successfully");
          queryClient.invalidateQueries(["financials", "airline", airlineId]);
          queryClient.invalidateQueries(["financial", airlineId, financialData.shipmentId]);
          onClose();
        },
        onError: (err) => {
          console.error("Financial update error:", err);
          toast.error(
            err.response?.data?.message || "Failed to update financial records",
          );
        },
      },
    );
  };

  if (!isOpen || !financialData) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-2 sm:p-4">
        <div
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
          style={{ animation: "modalEntry 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          {/* Header */}
          <div className="px-4 py-3.5 sm:px-8 sm:py-6 border-b border-gray-100 flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-tight truncate">
                  {effectiveViewOnly ? "View Financials" : "Edit Financials"}
                </h3>
                {isLocked && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shrink-0">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-400 mt-0.5 sm:mt-1 uppercase tracking-wide truncate">
                MAWB: {financialData.mawb}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 transition-all hover:scale-110 active:scale-95 shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Locked Notice Banner */}
          {isLocked && (
            <div className="mx-4 sm:mx-8 mt-3 sm:mt-4 p-2.5 sm:p-3 bg-amber-50 border border-amber-200/80 rounded-xl sm:rounded-2xl flex items-center gap-2 text-xs text-amber-900 font-medium">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                This financial record is locked because the shipment has been booked. It can only be viewed.
              </span>
            </div>
          )}

          {/* Stepper */}
          <div className="px-3 py-3 sm:px-12 sm:py-6 bg-gray-50/50 flex items-center">
            <StepIndicator
              num={1}
              active={step === 1}
              label="Basic Info"
              icon={Info}
            />
            <div
              className={`h-0.5 flex-1 mx-1.5 sm:mx-4 rounded-full transition-all ${step > 1 ? "bg-blue-600" : "bg-gray-200"}`}
            />
            <StepIndicator
              num={2}
              active={step === 2}
              label="Weights & Rates"
              icon={Calculator}
            />
            <div
              className={`h-0.5 flex-1 mx-1.5 sm:mx-4 rounded-full transition-all ${step > 2 ? "bg-blue-600" : "bg-gray-200"}`}
            />
            <StepIndicator
              num={3}
              active={step === 3}
              label="Charges & Commission"
              icon={DollarSign}
            />
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <InputField
                  label="MAWB"
                  name="mawb"
                  value={formData.mawb || ""}
                  onChange={handleChange}
                  disabled={effectiveViewOnly}
                />
                <InputField
                  label="Date of Issue"
                  name="dateOfIssue"
                  type="date"
                  value={formData.dateOfIssue || ""}
                  onChange={handleChange}
                  disabled={effectiveViewOnly}
                />
                <InputField
                  label="Agents/Clients"
                  name="agentsOrClients"
                  value={formData.agentsOrClients || ""}
                  onChange={handleChange}
                  disabled={effectiveViewOnly}
                />
                <InputField
                  label="Product"
                  name="product"
                  value={formData.product || ""}
                  onChange={handleChange}
                  disabled={effectiveViewOnly}
                />
                <InputField
                  label="Routing"
                  name="routing"
                  value={formData.routing || ""}
                  onChange={handleChange}
                  disabled={effectiveViewOnly}
                />
                <InputField
                  label="Flight No"
                  name="flightNo"
                  value={formData.flightNo || ""}
                  onChange={handleChange}
                  disabled={effectiveViewOnly}
                />
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <InputField
                  label="Pieces"
                  name="pieces"
                  type="text"
                  inputMode="numeric"
                  value={formData.pieces || ""}
                  onChange={handleChange}
                  disabled={effectiveViewOnly}
                  unit="pcs"
                />
                <InputField
                  label="Gross Weight (Kg)"
                  name="grossWeightKg"
                  type="text"
                  inputMode="decimal"
                  value={formData.grossWeightKg || ""}
                  onChange={handleChange}
                  disabled={effectiveViewOnly}
                  unit="kg"
                />
                <InputField
                  label="Chargeable Weight (Kg)"
                  name="chargeableWeightKg"
                  type="text"
                  inputMode="decimal"
                  value={formData.chargeableWeightKg || ""}
                  onChange={handleChange}
                  disabled={effectiveViewOnly}
                  unit="kg"
                />
                <InputField
                  label="Spot Rate (₦)"
                  name="spotRate"
                  type="text"
                  inputMode="decimal"
                  value={formData.spotRate || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isCurrency={true}
                  disabled={effectiveViewOnly}
                />
                <InputField
                  label="Published Rates (₦)"
                  name="publishedRates"
                  type="text"
                  inputMode="decimal"
                  value={formData.publishedRates || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isCurrency={true}
                  disabled={effectiveViewOnly}
                />
                <InputField
                  label="ROE (Rate of Exchange)"
                  name="roe"
                  type="text"
                  inputMode="decimal"
                  value={formData.roe || ""}
                  onChange={handleChange}
                  disabled={effectiveViewOnly}
                />
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <InputField
                  label="Freight Amt (₦)"
                  name="freightAmountNGN"
                  type="text"
                  inputMode="decimal"
                  value={formData.freightAmountNGN || ""}
                  onChange={handleChange}
                  disabled={true}
                  isCurrency={true}
                />
                <InputField
                  label="NCAA (5%) (₦)"
                  name="ncaaCharges5Percent"
                  type="text"
                  inputMode="decimal"
                  value={formData.ncaaCharges5Percent || ""}
                  onChange={handleChange}
                  disabled={true}
                  isCurrency={true}
                />
                <InputField
                  label="Total Charge (₦)"
                  name="totalChargeNGN"
                  type="text"
                  inputMode="decimal"
                  value={formData.totalChargeNGN || ""}
                  onChange={handleChange}
                  disabled={true}
                  isCurrency={true}
                />
                <InputField
                  label="Charges Collect (₦)"
                  name="chargesCollect"
                  type="text"
                  inputMode="decimal"
                  value={formData.chargesCollect || ""}
                  onChange={handleChange}
                  disabled={true}
                  isCurrency={true}
                />
                <InputField
                  label="Fuel Surcharge (₦)"
                  name="fuelSurcharge"
                  type="text"
                  inputMode="decimal"
                  value={formData.fuelSurcharge || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={effectiveViewOnly}
                  isCurrency={true}
                />
                <InputField
                  label="SEC Surcharge (₦)"
                  name="secSurcharge"
                  type="text"
                  inputMode="decimal"
                  value={formData.secSurcharge || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={effectiveViewOnly}
                  isCurrency={true}
                />
                <InputField
                  label="Handling Surcharge (₦)"
                  name="handlingSurcharge"
                  type="text"
                  inputMode="decimal"
                  value={formData.handlingSurcharge || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={effectiveViewOnly}
                  isCurrency={true}
                />
                <InputField
                  label="Surcharge Due Agent (₦)"
                  name="surchargeDueAgent"
                  type="text"
                  inputMode="decimal"
                  value={formData.surchargeDueAgent || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={effectiveViewOnly}
                  isCurrency={true}
                />
                <InputField
                  label="AWB Fee (₦)"
                  name="awbFee"
                  type="text"
                  inputMode="decimal"
                  value={formData.awbFee || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={effectiveViewOnly}
                  isCurrency={true}
                />
                <InputField
                  label="GSA Commission (₦)"
                  name="gsaCommissionNGN"
                  type="text"
                  inputMode="decimal"
                  value={formData.gsaCommissionNGN || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={effectiveViewOnly}
                  isCurrency={true}
                />
                <InputField
                  label="VAT on Commission (₦)"
                  name="vatOnCommission"
                  type="text"
                  inputMode="decimal"
                  value={formData.vatOnCommission || ""}
                  onChange={handleChange}
                  disabled={true}
                  isCurrency={true}
                />
                <InputField
                  label="Amt Due Airline (₦)"
                  name="amtDueAirline"
                  type="text"
                  inputMode="decimal"
                  value={formData.amtDueAirline || ""}
                  onChange={handleChange}
                  disabled={true}
                  isCurrency={true}
                />
                <InputField
                  label="Due APG Inc (₦)"
                  name="dueAPGInc"
                  type="text"
                  inputMode="decimal"
                  value={formData.dueAPGInc || ""}
                  onChange={handleChange}
                  disabled={true}
                  isCurrency={true}
                />
                <InputField
                  label="Due SLC (₦)"
                  name="dueSLC"
                  type="text"
                  inputMode="decimal"
                  value={formData.dueSLC || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={effectiveViewOnly}
                  isCurrency={true}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3.5 sm:px-8 sm:py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
            <button
              onClick={prevStep}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl transition-all active:scale-95 ${
                step === 1
                  ? "opacity-0 pointer-events-none"
                  : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
              >
                {effectiveViewOnly ? "Close" : "Cancel"}
              </button>

              {step < 3 ? (
                <button
                  onClick={nextStep}
                  style={{ backgroundColor: color }}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl shadow-blue-100 hover:shadow-blue-200 transition-all active:scale-95"
                >
                  <span className="whitespace-nowrap">Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : !effectiveViewOnly ? (
                <button
                  onClick={handleSubmit}
                  disabled={isUpdating}
                  style={{ backgroundColor: isUpdating ? "#f3f4f6" : color }}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl transition-all active:scale-95 ${
                    isUpdating
                      ? "text-gray-400 border border-gray-200"
                      : "text-white shadow-md sm:shadow-xl shadow-blue-100 hover:shadow-blue-200"
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span className="whitespace-nowrap">Save Changes</span>
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modalEntry {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </>
  );
};

export default EditFinancialsModal;
