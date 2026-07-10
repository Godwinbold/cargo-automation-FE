import React, { useState } from "react";
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

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  ...props
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest px-0.5">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500 opacity-80" : ""}`}
      {...(type === "number" ? { step: "any" } : {})}
      {...props}
    />
  </div>
);

const StepIndicator = ({ active, label, icon: Icon }) => (
  <div className="flex flex-col items-center flex-1">
    <div
      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-gray-100 text-gray-400"}`}
    >
      {React.createElement(Icon, { className: "w-5 h-5" })}
    </div>
    <span
      className={`text-[10px] font-bold mt-2 uppercase tracking-tight ${active ? "text-blue-600" : "text-gray-400"}`}
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

  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    mawb: airwayBillNumber || "",
  });

  // Reset form when modal opens or shipment changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData(
        applyFinancialCalculations({
          ...INITIAL_FORM_DATA,
          mawb: airwayBillNumber || "",
        }),
      );
      setStep(1);
    }
  }, [isOpen, airwayBillNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Numeric fields that should only accept numbers and decimals
    const numericFields = [
      "pieces", "chargeableWeightKg", "grossWeightKg", "spotRate", "publishedRates", 
      "roe", "freightAmountNGN", "ncaaCharges5Percent", "totalChargeNGN", 
      "chargesCollect", "fuelSurcharge", "secSurcharge", "handlingSurcharge", 
      "surchargeDueAgent", "awbFee", "gsaCommissionNGN", "vatOnCommission", 
      "amtDueAirline", "dueAPGInc", "dueSLC"
    ];

    if (numericFields.includes(name)) {
      // Only allow empty string or valid numbers (with optional decimal point)
      if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
        return;
      }
    }

    setFormData((prev) =>
      applyFinancialCalculations({ ...prev, [name]: value }),
    );
  };

  const toNum = (v) => {
    const n = parseFloat(v);
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
      dateOfIssue: new Date(formData.dateOfIssue).toISOString(),
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
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
          style={{ animation: "modalEntry 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-900 leading-tight">
                Create Financials
              </h3>
              <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-wide">
                Shipment: {airwayBillNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper */}
          <div className="px-12 py-6 bg-gray-50/50 flex items-center">
            <StepIndicator
              num={1}
              active={step === 1}
              label="Basic Info"
              icon={Info}
            />
            <div
              className={`h-0.5 flex-1 mx-4 rounded-full transition-all ${step > 1 ? "bg-blue-600" : "bg-gray-200"}`}
            />
            <StepIndicator
              num={2}
              active={step === 2}
              label="Weights & Rates"
              icon={Calculator}
            />
            <div
              className={`h-0.5 flex-1 mx-4 rounded-full transition-all ${step > 2 ? "bg-blue-600" : "bg-gray-200"}`}
            />
            <StepIndicator
              num={3}
              active={step === 3}
              label="Charges & Commission"
              icon={DollarSign}
            />
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
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
                  inputMode="decimal"
                />
                <InputField
                  label="Gross Weight (Kg)"
                  name="grossWeightKg"
                  type="text"
                  value={formData.grossWeightKg}
                  onChange={handleChange}
                  inputMode="decimal"
                />
                <InputField
                  label="Chargeable Weight (Kg)"
                  name="chargeableWeightKg"
                  type="text"
                  value={formData.chargeableWeightKg}
                  onChange={handleChange}
                  inputMode="decimal"
                />
                <InputField
                  label="Spot Rate"
                  name="spotRate"
                  type="text"
                  value={formData.spotRate}
                  onChange={handleChange}
                  inputMode="decimal"
                />
                <InputField
                  label="Published Rates"
                  name="publishedRates"
                  type="text"
                  value={formData.publishedRates}
                  onChange={handleChange}
                  inputMode="decimal"
                />
                <InputField
                  label="ROE"
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
                  label="Freight Amt (NGN)"
                  name="freightAmountNGN"
                  type="text"
                  value={formData.freightAmountNGN}
                  onChange={handleChange}
                  disabled={isCalculatedField("freightAmountNGN")}
                  inputMode="decimal"
                />
                <InputField
                  label="NCAA (5%)"
                  name="ncaaCharges5Percent"
                  type="text"
                  value={formData.ncaaCharges5Percent}
                  onChange={handleChange}
                  disabled={isCalculatedField("ncaaCharges5Percent")}
                  inputMode="decimal"
                />
                <InputField
                  label="Total Charge (NGN)"
                  name="totalChargeNGN"
                  type="text"
                  value={formData.totalChargeNGN}
                  onChange={handleChange}
                  disabled={isCalculatedField("totalChargeNGN")}
                  inputMode="decimal"
                />
                <InputField
                  label="Charges Collect"
                  name="chargesCollect"
                  type="text"
                  value={formData.chargesCollect}
                  onChange={handleChange}
                  disabled={isCalculatedField("chargesCollect")}
                  inputMode="decimal"
                />
                <InputField
                  label="Fuel Surcharge"
                  name="fuelSurcharge"
                  type="text"
                  value={formData.fuelSurcharge}
                  onChange={handleChange}
                  inputMode="decimal"
                />
                <InputField
                  label="SEC Surcharge"
                  name="secSurcharge"
                  type="text"
                  value={formData.secSurcharge}
                  onChange={handleChange}
                  inputMode="decimal"
                />
                <InputField
                  label="Handling Surcharge"
                  name="handlingSurcharge"
                  type="text"
                  value={formData.handlingSurcharge}
                  onChange={handleChange}
                  inputMode="decimal"
                />
                <InputField
                  label="Surcharge (Agent)"
                  name="surchargeDueAgent"
                  type="text"
                  value={formData.surchargeDueAgent}
                  onChange={handleChange}
                  inputMode="decimal"
                />
                <InputField
                  label="AWB Fee"
                  name="awbFee"
                  type="text"
                  value={formData.awbFee}
                  onChange={handleChange}
                  inputMode="decimal"
                />
                <InputField
                  label="GSA Commission (NGN)"
                  name="gsaCommissionNGN"
                  type="text"
                  value={formData.gsaCommissionNGN}
                  onChange={handleChange}
                  inputMode="decimal"
                />
                <InputField
                  label="VAT (Commission)"
                  name="vatOnCommission"
                  type="text"
                  value={formData.vatOnCommission}
                  onChange={handleChange}
                  disabled={isCalculatedField("vatOnCommission")}
                  inputMode="decimal"
                />
                <InputField
                  label="Amt Due Airline"
                  name="amtDueAirline"
                  type="text"
                  value={formData.amtDueAirline}
                  onChange={handleChange}
                  disabled={isCalculatedField("amtDueAirline")}
                  inputMode="decimal"
                />
                <InputField
                  label="Due APG Inc"
                  name="dueAPGInc"
                  type="text"
                  value={formData.dueAPGInc}
                  onChange={handleChange}
                  disabled={isCalculatedField("dueAPGInc")}
                  inputMode="decimal"
                />
                <InputField
                  label="Due SLC"
                  name="dueSLC"
                  type="text"
                  value={formData.dueSLC}
                  onChange={handleChange}
                  inputMode="decimal"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <button
              onClick={prevStep}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl transition-all active:scale-95 ${step === 1 ? "opacity-0 pointer-events-none" : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-100"}`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>

              {step < 3 ? (
                <button
                  onClick={nextStep}
                  style={{ backgroundColor: color }}
                  className="flex items-center gap-2 px-8 py-3 text-sm font-bold text-white rounded-2xl shadow-xl shadow-blue-100 hover:shadow-blue-200 transition-all active:scale-95"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isCreating}
                  style={{ backgroundColor: isCreating ? "#f3f4f6" : color }}
                  className={`flex items-center gap-2 px-8 py-3 text-sm font-bold rounded-2xl transition-all active:scale-95 ${isCreating ? "text-gray-400 border border-gray-200" : "text-white shadow-xl shadow-blue-100 hover:shadow-blue-200"}`}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Complete & Create</span>
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
