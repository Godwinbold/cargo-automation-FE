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
} from "lucide-react";
import { useCreateFinancial } from "../../hooks/useShipment";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  CALCULATED_FINANCIAL_FIELDS,
  applyFinancialCalculations,
} from "../../utils/financialCalculations";

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

// Numeric fields stored as strings so controlled inputs can be cleared/retyped
// freely without React snapping them back to 0. Converted to numbers on submit.
const INITIAL_FORM_DATA = {
  mawb: "",
  dateOfIssue: new Date().toISOString().split("T")[0],
  agentsOrClients: "",
  product: "",
  routing: "",
  flightNo: "",
  pieces: "",
  chargeableWeightKg: "",
  grossWeightKg: "",
  spotRate: "",
  publishedRates: "",
  roe: "",
  freightAmountNGN: "",
  ncaaCharges5Percent: "",
  totalChargeNGN: "",
  chargesCollect: "",
  fuelSurcharge: "",
  secSurcharge: "",
  handlingSurcharge: "",
  surchargeDueAgent: "",
  awbFee: "",
  gsaCommissionNGN: "",
  vatOnCommission: "",
  amtDueAirline: "",
  dueAPGInc: "",
  dueSLC: "",
};

const isCalculatedField = (name) => CALCULATED_FINANCIAL_FIELDS.includes(name);

const CreateFinancialsModal = ({
  isOpen,
  onClose,
  airlineId,
  shipmentId,
  airwayBillNumber,
  color,
}) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const { mutate: createFinancial, isPending: isCreating } =
    useCreateFinancial();

  const [formData, setFormData] = useState(() =>
    applyFinancialCalculations({
      ...INITIAL_FORM_DATA,
      mawb: airwayBillNumber || "",
    }),
  );

  // Sync MAWB if airwayBillNumber changes or modal opens
  useEffect(() => {
    if (isOpen && airwayBillNumber) {
      setFormData((prev) => ({
        ...prev,
        mawb: airwayBillNumber,
      }));
    }
  }, [isOpen, airwayBillNumber]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      return applyFinancialCalculations(updated);
    });
  };

  const formatCurrencyValue = (v) => {
    if (v === "" || v === null || v === undefined) return "";
    const n = parseFloat(String(v).replace(/,/g, ""));
    return isNaN(n)
      ? v
      : n.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (CURRENCY_FIELDS.includes(name) && value) {
      setFormData((prev) => {
        const formatted = formatCurrencyValue(value);
        const updated = { ...prev, [name]: formatted };
        return applyFinancialCalculations(updated);
      });
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
    // Only send the 26 fields the backend expects — convert strings to numbers here.
    const payload = {
      mawb: formData.mawb,
      dateOfIssue: formData.dateOfIssue
        ? new Date(formData.dateOfIssue).toISOString()
        : null,
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

    createFinancial(
      { airlineId, shipmentId, data: payload },
      {
        onSuccess: () => {
          toast.success("Financial records created successfully");
          queryClient.invalidateQueries(["financials", "airline", airlineId]);
          queryClient.invalidateQueries(["financial", airlineId]);
          queryClient.invalidateQueries(["financial", airlineId, shipmentId]);
          onClose();
          // Reset form state
          setFormData(
            applyFinancialCalculations({
              ...INITIAL_FORM_DATA,
              mawb: airwayBillNumber || "",
            }),
          );
          setStep(1);
        },
        onError: (err) => {
          console.error("Financial creation error:", err);
          toast.error(
            err.response?.data?.message || "Failed to create financial records",
          );
        },
      },
    );
  };

  if (!isOpen) return null;

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
              <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-tight truncate">
                Create Financials
              </h3>
              <p className="text-xs sm:text-sm font-medium text-gray-400 mt-0.5 sm:mt-1 uppercase tracking-wide truncate">
                Shipment: {airwayBillNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 transition-all hover:scale-110 active:scale-95 shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
                  value={formData.mawb}
                  onChange={handleChange}
                />
                <InputField
                  label="Date of Issue"
                  name="dateOfIssue"
                  type="date"
                  value={formData.dateOfIssue}
                  onChange={handleChange}
                />
                <InputField
                  label="Agents/Clients"
                  name="agentsOrClients"
                  value={formData.agentsOrClients}
                  onChange={handleChange}
                />
                <InputField
                  label="Product"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                />
                <InputField
                  label="Routing"
                  name="routing"
                  value={formData.routing}
                  onChange={handleChange}
                />
                <InputField
                  label="Flight No"
                  name="flightNo"
                  value={formData.flightNo}
                  onChange={handleChange}
                />
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <InputField
                  label="Pieces"
                  name="pieces"
                  type="text"
                  value={formData.pieces}
                  onChange={handleChange}
                  unit="pcs"
                  inputMode="numeric"
                />
                <InputField
                  label="Gross Weight (Kg)"
                  name="grossWeightKg"
                  type="text"
                  value={formData.grossWeightKg}
                  onChange={handleChange}
                  unit="kg"
                  inputMode="decimal"
                />
                <InputField
                  label="Chargeable Weight (Kg)"
                  name="chargeableWeightKg"
                  type="text"
                  value={formData.chargeableWeightKg}
                  onChange={handleChange}
                  unit="kg"
                  inputMode="decimal"
                />
                <InputField
                  label="Spot Rate (₦)"
                  name="spotRate"
                  type="text"
                  value={formData.spotRate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="Published Rates (₦)"
                  name="publishedRates"
                  type="text"
                  value={formData.publishedRates}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="ROE (Rate of Exchange)"
                  name="roe"
                  type="text"
                  value={formData.roe}
                  onChange={handleChange}
                  inputMode="decimal"
                />
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <InputField
                  label="Freight Amt (₦)"
                  name="freightAmountNGN"
                  type="text"
                  value={formData.freightAmountNGN}
                  onChange={handleChange}
                  disabled={isCalculatedField("freightAmountNGN")}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="NCAA (5%) (₦)"
                  name="ncaaCharges5Percent"
                  type="text"
                  value={formData.ncaaCharges5Percent}
                  onChange={handleChange}
                  disabled={isCalculatedField("ncaaCharges5Percent")}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="Total Charge (₦)"
                  name="totalChargeNGN"
                  type="text"
                  value={formData.totalChargeNGN}
                  onChange={handleChange}
                  disabled={isCalculatedField("totalChargeNGN")}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="Charges Collect (₦)"
                  name="chargesCollect"
                  type="text"
                  value={formData.chargesCollect}
                  onChange={handleChange}
                  disabled={isCalculatedField("chargesCollect")}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="Fuel Surcharge (₦)"
                  name="fuelSurcharge"
                  type="text"
                  value={formData.fuelSurcharge}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="SEC Surcharge (₦)"
                  name="secSurcharge"
                  type="text"
                  value={formData.secSurcharge}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="Handling Surcharge (₦)"
                  name="handlingSurcharge"
                  type="text"
                  value={formData.handlingSurcharge}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="Surcharge Due Agent (₦)"
                  name="surchargeDueAgent"
                  type="text"
                  value={formData.surchargeDueAgent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="AWB Fee (₦)"
                  name="awbFee"
                  type="text"
                  value={formData.awbFee}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="GSA Commission (₦)"
                  name="gsaCommissionNGN"
                  type="text"
                  value={formData.gsaCommissionNGN}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="VAT on Commission (₦)"
                  name="vatOnCommission"
                  type="text"
                  value={formData.vatOnCommission}
                  onChange={handleChange}
                  disabled={isCalculatedField("vatOnCommission")}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="Amt Due Airline (₦)"
                  name="amtDueAirline"
                  type="text"
                  value={formData.amtDueAirline}
                  onChange={handleChange}
                  disabled={isCalculatedField("amtDueAirline")}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="Due APG Inc (₦)"
                  name="dueAPGInc"
                  type="text"
                  value={formData.dueAPGInc}
                  onChange={handleChange}
                  disabled={isCalculatedField("dueAPGInc")}
                  isCurrency={true}
                  inputMode="decimal"
                />
                <InputField
                  label="Due SLC (₦)"
                  name="dueSLC"
                  type="text"
                  value={formData.dueSLC}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isCurrency={true}
                  inputMode="decimal"
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
                Cancel
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
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isCreating}
                  style={{ backgroundColor: isCreating ? "#f3f4f6" : color }}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl transition-all active:scale-95 ${
                    isCreating
                      ? "text-gray-400 border border-gray-200"
                      : "text-white shadow-md sm:shadow-xl shadow-blue-100 hover:shadow-blue-200"
                  }`}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span className="whitespace-nowrap">Submit</span>
                    </>
                  )}
                </button>
              )}
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

export default CreateFinancialsModal;
