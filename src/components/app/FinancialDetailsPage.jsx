import React, { useState, useMemo } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CircleDollarSign,
  Calendar,
  Plane,
  Scale,
  Building,
  Edit2,
  Trash2,
  Clock,
  Layers,
  TrendingUp,
  CreditCard,
  Hash,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  useGetShipmentById,
  useGetFinancial,
  useGetAirlinesFinancials,
  useDeleteFinancial,
} from "../../hooks/useShipment";
import { GetFromLocalStorage } from "../../utils/getFromLocals";
import { formatShipmentId, formatCurrencyValue } from "../../utils/shipmentUtils";
import EditFinancialsModal from "./EditFinancialsModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusColors = {
  Accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Booked: "bg-amber-50 text-amber-700 border-amber-200",
  Flown: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-purple-50 text-purple-700 border-purple-200",
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const SAMPLE_FINANCIAL_DATA = {
  mawb: "123456754",
  dateOfIssue: "2026-09-21T00:00:00",
  agentsOrClients: "3456",
  product: "fgjfjjgfj",
  routing: "2345",
  flightNo: "4567",
  pieces: 566,
  chargeableWeightKg: 45655000.0,
  grossWeightKg: 4567000.0,
  spotRate: 567.0,
  publishedRates: 5678.0,
  roe: 678.0,
  freightAmountNGN: 51333.0,
  ncaaCharges5Percent: 2566.65,
  totalChargeNGN: 18168.0,
  chargesCollect: 51333.0,
  fuelSurcharge: 5678.0,
  secSurcharge: 5678.0,
  handlingSurcharge: 567.0,
  surchargeDueAgent: 5678.0,
  awbFee: 567.0,
  gsaCommissionNGN: 5678.0,
  vatOnCommission: 425.85,
  amtDueAirline: 57152.15,
  dueAPGInc: 1703.4,
  dueSLC: 5678.0,
  createdDate: "2026-09-21T10:18:58.1101048+00:00",
  updatedDate: "2026-09-21T10:18:58.1101049+00:00",
};

const FinancialDetailsPage = ({ color = "#04549B", name }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const airlineIdFromQuery = searchParams.get("airlineId");
  const airlineId = GetFromLocalStorage("airlineId") || airlineIdFromQuery;

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Delete mutation
  const { mutate: deleteFinancial, isPending: isDeleting } = useDeleteFinancial();

  // Fallback financial data from route state if navigated with state
  const stateFinancial = location.state?.financial;

  // Fetch airline financials list to locate record by ID if state not available
  const { data: airlineFinancialsData, isLoading: isLoadingAirlineFin } =
    useGetAirlinesFinancials(
      airlineId,
      { pageSize: 500 },
      { enabled: !stateFinancial && !!airlineId },
    );

  const resolvedFinancial = useMemo(() => {
    if (stateFinancial) return stateFinancial;
    const items =
      airlineFinancialsData?.data?.items ||
      airlineFinancialsData?.data?.data ||
      airlineFinancialsData?.data ||
      [];
    if (Array.isArray(items)) {
      return (
        items.find((f) => String(f.id) === String(id)) ||
        items.find((f) => String(f.shipmentId) === String(id)) ||
        null
      );
    }
    return null;
  }, [stateFinancial, airlineFinancialsData, id]);

  const shipmentId = resolvedFinancial?.shipmentId || id;

  // Fetch specific financial for this shipment
  const { data: directFinancialData } = useGetFinancial(
    airlineId,
    shipmentId,
    { enabled: !!airlineId && !!shipmentId },
  );

  const financial = useMemo(() => {
    const live = directFinancialData?.data || resolvedFinancial;
    if (live) {
      return { ...SAMPLE_FINANCIAL_DATA, ...live };
    }
    return SAMPLE_FINANCIAL_DATA;
  }, [directFinancialData, resolvedFinancial]);

  // Fetch linked shipment status if available
  const { data: shipmentData } = useGetShipmentById(airlineId, shipmentId, {
    enabled: !!airlineId && !!shipmentId,
  });

  const shipment = useMemo(() => {
    return (
      shipmentData?.data ||
      financial?.shipment ||
      (resolvedFinancial?.shipmentId ? { id: resolvedFinancial.shipmentId } : null)
    );
  }, [shipmentData, financial, resolvedFinancial]);

  const shipmentStatus =
    shipment?.statusDisplay ||
    financial?.shipmentStatus ||
    financial?.shipment?.statusDisplay ||
    "Accepted";

  const isLocked = ["Booked", "Flown", "Delivered"].includes(shipmentStatus);
  const isAccepted = shipmentStatus?.toLowerCase() === "accepted";

  const handleBack = () => {
    navigate(
      `/${name}-dashboard/financials${
        airlineId ? `?airlineId=${airlineId}` : ""
      }`,
    );
  };

  const handleConfirmDelete = () => {
    if (!financial) return;

    deleteFinancial(
      {
        airlineId,
        shipmentId: financial?.shipmentId || shipmentId,
        financialId: financial?.id,
      },
      {
        onSuccess: () => {
          toast.success("Financial record deleted successfully");
          queryClient.invalidateQueries(["financials", "airline", airlineId]);
          queryClient.invalidateQueries(["financial", airlineId, shipmentId]);
          setIsDeleteModalOpen(false);
          navigate(
            `/${name}-dashboard/financials${
              airlineId ? `?airlineId=${airlineId}` : ""
            }`,
          );
        },
        onError: (err) => {
          toast.error(
            err.response?.data?.message || "Failed to delete financial record",
          );
        },
      },
    );
  };

  const mawbNumber =
    financial?.mawb ||
    shipment?.airwayBillNumber ||
    (id ? formatShipmentId(id) : "N/A");

  return (
    <div className="min-h-screen bg-gray-50/50 p-3 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 active:bg-gray-200 border border-gray-200 rounded-xl transition-all shadow-sm hover:shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Financials</span>
        </button>

        {/* Edit and Delete action buttons - ONLY visible if Accepted */}
        <div className="flex items-center gap-2.5">
          {isAccepted && (
            <>
              <button
                onClick={() => setIsEditModalOpen(true)}
                style={{ borderColor: color, color }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white border rounded-xl hover:bg-gray-50 transition-all shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Financial</span>
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 rounded-xl transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Financial</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                style={{ backgroundColor: `${color}15`, color }}
                className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border border-transparent"
              >
                MAWB / AWB
              </span>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                  statusColors[shipmentStatus] || "bg-gray-100 text-gray-700 border-gray-200"
                }`}
              >
                {shipmentStatus}
              </span>
              {isLocked && (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Locked ({shipmentStatus})
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {mawbNumber}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Shipment ID:{" "}
              <span className="font-semibold text-gray-700">
                {formatShipmentId(shipmentId)}
              </span>{" "}
              • Created on {formatDate(financial?.createdDate || shipment?.createdDate)}
            </p>

            {/* Edit and Delete under Shipment ID */}
            {isAccepted && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  style={{ borderColor: color, color }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border rounded-xl hover:bg-gray-50 transition-all shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Financial</span>
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Financial</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Financial Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:min-w-[520px]">
            <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                Total Charge
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-700 truncate block">
                {financial?.totalChargeNGN != null
                  ? `₦${formatCurrencyValue(financial.totalChargeNGN)}`
                  : "—"}
              </span>
            </div>

            <div className="bg-blue-50/70 rounded-xl p-3.5 border border-blue-100">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                Amount Due Airline
              </span>
              <span className="text-base sm:text-lg font-black text-blue-700 truncate block">
                {financial?.amtDueAirline != null
                  ? `₦${formatCurrencyValue(financial.amtDueAirline)}`
                  : "—"}
              </span>
            </div>

            <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Freight Amount
              </span>
              <span className="text-base sm:text-lg font-black text-gray-900 truncate block">
                {financial?.freightAmountNGN != null
                  ? `₦${formatCurrencyValue(financial.freightAmountNGN)}`
                  : "—"}
              </span>
            </div>

            <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Chargeable Wt
              </span>
              <span className="text-base sm:text-lg font-black text-gray-900 truncate block">
                {financial?.chargeableWeightKg != null
                  ? `${(financial.chargeableWeightKg / 1000).toLocaleString()} kg`
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FINANCIAL DETAILS CONTENT AREA */}
      <div className="w-full space-y-6">
        {/* Shipment ID & Financial Actions Banner */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Shipment ID
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base sm:text-lg font-mono font-bold text-gray-900 select-all">
                  {shipmentId || "—"}
                </span>
              </div>
            </div>
          </div>

          {isAccepted && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                style={{ borderColor: color, color }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold bg-white border rounded-xl hover:bg-gray-50 transition-all shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Financial</span>
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 rounded-xl transition-all shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Financial</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 1: Flight & Cargo Particulars */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Flight & Cargo Particulars
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  Airway bill, routing, agents, and cargo specifications
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">
              MAWB: {financial?.mawb || "—"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Shipment ID
              </span>
              <span className="text-sm font-bold text-gray-900 font-mono select-all">
                {formatShipmentId(shipmentId)}
              </span>
              {isAccepted && (
                <div className="flex items-center gap-2 pt-2 mt-1 border-t border-gray-200/60">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    style={{ borderColor: color, color }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white border rounded-lg hover:bg-gray-50 transition-all shadow-xs"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all shadow-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Master Airway Bill (MAWB)
              </span>
              <span className="text-sm font-bold text-gray-900 font-mono">
                {financial?.mawb || "—"}
              </span>
            </div>

            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Flight Number
              </span>
              <span className="text-sm font-bold text-gray-900">
                {financial?.flightNo || "—"}
              </span>
            </div>

            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Routing
              </span>
              <span className="text-sm font-bold text-gray-900">
                {financial?.routing || "—"}
              </span>
            </div>

            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Date of Issue
              </span>
              <span className="text-sm font-bold text-gray-900">
                {formatDate(financial?.dateOfIssue)}
              </span>
              {financial?.dateOfIssue && (
                <span className="text-[10px] text-gray-400 font-mono">
                  {financial.dateOfIssue}
                </span>
              )}
            </div>

            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Product / Cargo Description
              </span>
              <span className="text-sm font-bold text-gray-900">
                {financial?.product || "—"}
              </span>
            </div>

            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Agents or Clients
              </span>
              <span className="text-sm font-bold text-gray-900">
                {financial?.agentsOrClients || "—"}
              </span>
            </div>

            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Number of Pieces
              </span>
              <span className="text-sm font-bold text-gray-900">
                {financial?.pieces != null ? financial.pieces.toLocaleString() : "—"}
              </span>
            </div>

            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Gross Weight (kg)
              </span>
              <span className="text-sm font-bold text-gray-900">
                {financial?.grossWeightKg != null
                  ? `${Number(financial.grossWeightKg).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`
                  : "—"}
              </span>
            </div>

            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Chargeable Weight (kg)
              </span>
              <span className="text-sm font-bold text-gray-900">
                {financial?.chargeableWeightKg != null
                  ? `${Number(financial.chargeableWeightKg).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: 3-Column Financial Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card A: Tariff & Freight Base */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Tariff & Freight Rates
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  Tariff rates, exchange rate, and freight base
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Spot Rate ($)</span>
                <span className="font-bold text-gray-900">
                  ${formatCurrencyValue(financial?.spotRate)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Published Rates ($)</span>
                <span className="font-bold text-gray-900">
                  ${formatCurrencyValue(financial?.publishedRates)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Rate of Exchange (ROE)</span>
                <span className="font-bold text-gray-900">
                  ₦{formatCurrencyValue(financial?.roe)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Freight Amount (NGN)</span>
                <span className="font-bold text-gray-900">
                  ₦{formatCurrencyValue(financial?.freightAmountNGN)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Charges Collect</span>
                <span className="font-bold text-gray-900">
                  ₦{formatCurrencyValue(financial?.chargesCollect)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">NCAA Charges (5%)</span>
                <span className="font-bold text-gray-900 text-blue-600">
                  ₦{formatCurrencyValue(financial?.ncaaCharges5Percent)}
                </span>
              </div>
            </div>
          </div>

          {/* Card B: Surcharges & Fees Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Surcharges & Fees
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  Itemized surcharges and cargo fees
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Fuel Surcharge</span>
                <span className="font-bold text-gray-900">
                  ₦{formatCurrencyValue(financial?.fuelSurcharge)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Security Surcharge</span>
                <span className="font-bold text-gray-900">
                  ₦{formatCurrencyValue(financial?.secSurcharge)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Handling Surcharge</span>
                <span className="font-bold text-gray-900">
                  ₦{formatCurrencyValue(financial?.handlingSurcharge)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Surcharge Due Agent</span>
                <span className="font-bold text-gray-900">
                  ₦{formatCurrencyValue(financial?.surchargeDueAgent)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Airway Bill (AWB) Fee</span>
                <span className="font-bold text-gray-900">
                  ₦{formatCurrencyValue(financial?.awbFee)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-50 bg-emerald-50/70 px-3 rounded-xl font-black">
                <span className="text-emerald-900">Total Charge (NGN)</span>
                <span className="text-emerald-700">
                  ₦{formatCurrencyValue(financial?.totalChargeNGN)}
                </span>
              </div>
            </div>
          </div>

          {/* Card C: Commissions & Settlements */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Commissions & Settlements
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  Commission retentions and airline net payable
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">GSA Commission (NGN)</span>
                <span className="font-bold text-gray-900">
                  ₦{formatCurrencyValue(financial?.gsaCommissionNGN)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">VAT on Commission (7.5%)</span>
                <span className="font-bold text-gray-900">
                  ₦{formatCurrencyValue(financial?.vatOnCommission)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Due APG Inc</span>
                <span className="font-bold text-gray-900">
                  ₦{formatCurrencyValue(financial?.dueAPGInc)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Due SLC</span>
                <span className="font-bold text-gray-900">
                  ₦{formatCurrencyValue(financial?.dueSLC)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-50 bg-blue-50/70 px-3 rounded-xl font-black">
                <span className="text-blue-900">Amount Due Airline</span>
                <span className="text-blue-700">
                  ₦{formatCurrencyValue(financial?.amtDueAirline)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Audit Trail & Timestamps */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-4">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Audit Trail & Timestamps
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                System creation and modification lifecycle timestamps
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Created Date
              </span>
              <span className="text-sm font-bold text-gray-900">
                {formatDateTime(financial?.createdDate)}
              </span>
              {financial?.createdDate && (
                <span className="text-xs text-gray-500 font-mono select-all break-all">
                  {financial.createdDate}
                </span>
              )}
            </div>

            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Updated Date
              </span>
              <span className="text-sm font-bold text-gray-900">
                {formatDateTime(financial?.updatedDate)}
              </span>
              {financial?.updatedDate && (
                <span className="text-xs text-gray-500 font-mono select-all break-all">
                  {financial.updatedDate}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Financials Modal */}
      {isEditModalOpen && financial && (
        <EditFinancialsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          financialData={{
            ...financial,
            shipmentStatus,
            isLocked: !isAccepted,
          }}
          airlineId={airlineId}
          color={color}
          isViewOnly={!isAccepted}
          isLocked={!isAccepted}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Financial Record"
        message="Are you sure you want to delete the financial record for MAWB"
        identifier={mawbNumber}
        isDeleting={isDeleting}
        color={color}
      />
    </div>
  );
};

export default FinancialDetailsPage;
