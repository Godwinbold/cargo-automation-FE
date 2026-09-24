import React, { useState, useMemo } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  CircleDollarSign,
  FileText,
  Calendar,
  Plane,
  Scale,
  Building,
  Edit2,
  FileUp,
  Download,
  Eye,
  FolderOpen,
  FileImage,
  FileIcon,
  Clock,
  Layers,
  TrendingUp,
  CreditCard,
  Hash,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useGetShipmentById,
  useGetFinancial,
  useGetDocuments,
  useGetAirlinesFinancials,
  useGetShipments,
  useDeleteFinancial,
  useDeleteShipment,
} from "../../hooks/useShipment";
import { GetFromLocalStorage } from "../../utils/getFromLocals";
import { formatShipmentId, formatCurrencyValue } from "../../utils/shipmentUtils";
import EditFinancialsModal from "./EditFinancialsModal";
import CreateFinancialsModal from "./CreateFinancialsModal";
import DocumentPreviewModal from "./DocumentPreviewModal";
import UploadDocumentModal from "./UploadDocumentModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusColors = {
  Accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Booked: "bg-amber-50 text-amber-700 border-amber-200",
  Flown: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-purple-50 text-purple-700 border-purple-200",
};

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

const resolveUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("cloudinary://")) {
    const stripped = path.replace("cloudinary://", "");
    return `https://res.cloudinary.com/${stripped}`;
  }
  return path;
};

const FileTypeIcon = ({ contentType }) => {
  if (contentType?.startsWith("image/")) {
    return <FileImage className="w-5 h-5 text-blue-500" />;
  }
  if (contentType === "application/pdf") {
    return <FileText className="w-5 h-5 text-red-500" />;
  }
  return <FileIcon className="w-5 h-5 text-gray-400" />;
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

const ShipmentDetailsPage = ({ color = "#04549B", name }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const airlineIdFromQuery = searchParams.get("airlineId");
  const airlineId = GetFromLocalStorage("airlineId") || airlineIdFromQuery;

  // Active Tab state: "shipment" | "financials" | "documents"
  const [activeTab, setActiveTab] = useState("shipment");

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateFinancialModalOpen, setIsCreateFinancialModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Fallback shipment or financial data from router state
  const stateShipment = location.state?.shipment;
  const stateFinancial = location.state?.financial;

  // 1. Fetch shipment directly by ID
  const { data: shipmentData, isLoading: isLoadingShipment } =
    useGetShipmentById(airlineId, id, {
      enabled: !!airlineId && !!id,
    });

  // If id is a financial record's ID instead of shipment ID, find shipment ID from financials list
  const { data: airlineFinancialsData } = useGetAirlinesFinancials(
    airlineId,
    { pageSize: 500 },
    { enabled: !stateShipment && !shipmentData?.data && !!airlineId },
  );

  const matchedFinancialByAnyId = useMemo(() => {
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

  const resolvedShipmentId =
    stateShipment?.id ||
    shipmentData?.data?.id ||
    matchedFinancialByAnyId?.shipmentId ||
    id;

  const shipment = useMemo(() => {
    return (
      stateShipment ||
      shipmentData?.data ||
      matchedFinancialByAnyId?.shipment ||
      (resolvedShipmentId ? { id: resolvedShipmentId } : null)
    );
  }, [stateShipment, shipmentData, matchedFinancialByAnyId, resolvedShipmentId]);

  // 2. Fetch specific financial for this shipment
  const { data: directFinancialData, isLoading: isLoadingFinancial } =
    useGetFinancial(airlineId, resolvedShipmentId, {
      enabled: !!airlineId && !!resolvedShipmentId,
    });

  const financial = useMemo(() => {
    const live = directFinancialData?.data || matchedFinancialByAnyId;
    if (live) {
      return { ...SAMPLE_FINANCIAL_DATA, ...live };
    }
    return SAMPLE_FINANCIAL_DATA;
  }, [directFinancialData, matchedFinancialByAnyId]);

  // 3. Fetch linked documents for this shipment
  const { data: documentsData, isLoading: isLoadingDocs } = useGetDocuments(
    airlineId,
    resolvedShipmentId,
    { pageSize: 50 },
    { enabled: !!airlineId && !!resolvedShipmentId },
  );

  const documents = useMemo(() => {
    const raw = documentsData?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  }, [documentsData]);

  const shipmentStatus =
    shipment?.statusDisplay ||
    financial?.shipmentStatus ||
    financial?.shipment?.statusDisplay ||
    "Accepted";

  const isLocked = ["Booked", "Flown", "Delivered"].includes(shipmentStatus);
  const isAccepted = shipmentStatus?.toLowerCase() === "accepted";
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteShipmentModalOpen, setIsDeleteShipmentModalOpen] = useState(false);
  const { mutate: deleteFinancial, isPending: isDeleting } = useDeleteFinancial();
  const { mutate: deleteShipmentMutation, isPending: isDeletingShipment } =
    useDeleteShipment();

  const handleConfirmDeleteShipment = () => {
    if (!resolvedShipmentId) return;
    deleteShipmentMutation(
      { airlineId, id: resolvedShipmentId },
      {
        onSuccess: () => {
          toast.success("Shipment deleted successfully");
          queryClient.invalidateQueries(["shipments", airlineId]);
          setIsDeleteShipmentModalOpen(false);
          navigate(
            `/${name}-dashboard/shipment${
              airlineId ? `?airlineId=${airlineId}` : ""
            }`,
          );
        },
        onError: (err) => {
          toast.error(
            err.response?.data?.message || "Failed to delete shipment",
          );
        },
      },
    );
  };

  const handleConfirmDeleteFinancial = () => {
    if (!financial) return;
    deleteFinancial(
      {
        airlineId,
        shipmentId: financial?.shipmentId || resolvedShipmentId,
        financialId: financial?.id,
      },
      {
        onSuccess: () => {
          toast.success("Financial record deleted successfully");
          queryClient.invalidateQueries(["financials", "airline", airlineId]);
          queryClient.invalidateQueries(["financial", airlineId, resolvedShipmentId]);
          setIsDeleteModalOpen(false);
        },
        onError: (err) => {
          toast.error(
            err.response?.data?.message || "Failed to delete financial record",
          );
        },
      },
    );
  };

  const handleDownloadDoc = (doc) => {
    const url = resolveUrl(doc.storagePath);
    if (!url) return;
    const link = window.document.createElement("a");
    link.href = url;
    link.download = doc.fileName || "document";
    link.target = "_blank";
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const isFromFinancials = location.pathname.includes("/financial");

  const handleBack = () => {
    if (isFromFinancials) {
      navigate(
        `/${name}-dashboard/financials${
          airlineId ? `?airlineId=${airlineId}` : ""
        }`,
      );
    } else {
      navigate(
        `/${name}-dashboard/shipment${
          airlineId ? `?airlineId=${airlineId}` : ""
        }`,
      );
    }
  };

  const mawbNumber =
    shipment?.airwayBillNumber ||
    financial?.mawb ||
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
          <span>{isFromFinancials ? "Back to Financials" : "Back to Shipments"}</span>
        </button>

        <div className="flex items-center gap-2.5">
          {isAccepted && (
            <>
              <button
                onClick={() => {
                  if (financial) {
                    setIsEditModalOpen(true);
                  } else {
                    setIsCreateFinancialModalOpen(true);
                  }
                }}
                style={{ borderColor: color, color }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white border rounded-xl hover:bg-gray-50 transition-all shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                <span>
                  {activeTab === "financials"
                    ? "Edit Financial"
                    : "Edit Shipment"}
                </span>
              </button>

              <button
                onClick={() => {
                  if (activeTab === "financials" && financial) {
                    setIsDeleteModalOpen(true);
                  } else {
                    setIsDeleteShipmentModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 rounded-xl transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {activeTab === "financials" && financial
                    ? "Delete Financial"
                    : "Delete Shipment"}
                </span>
              </button>
            </>
          )}

          {activeTab === "documents" && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              style={{ backgroundColor: color }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl hover:opacity-95 transition-all shadow-sm"
            >
              <FileUp className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
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
                Airway Bill (AWB)
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
                  Locked (Booked)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {mawbNumber}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Shipment ID:{" "}
              <span className="font-semibold text-gray-700">
                {formatShipmentId(resolvedShipmentId)}
              </span>{" "}
              • Created on {formatDate(shipment?.createdDate || financial?.createdDate)}
            </p>

            {/* Edit and Delete under Shipment ID */}
            {isAccepted && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    if (financial) setIsEditModalOpen(true);
                    else setIsCreateFinancialModalOpen(true);
                  }}
                  style={{ borderColor: color, color }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border rounded-xl hover:bg-gray-50 transition-all shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>
                    Edit {activeTab === "financials" ? "Financial" : "Shipment"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (activeTab === "financials" && financial) {
                      setIsDeleteModalOpen(true);
                    } else {
                      setIsDeleteShipmentModalOpen(true);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    Delete {activeTab === "financials" && financial ? "Financial" : "Shipment"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:min-w-[480px]">
            <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Status
              </span>
              <span className="text-base sm:text-lg font-black text-gray-900 truncate block">
                {shipmentStatus}
              </span>
            </div>

            <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Chargeable Wt
              </span>
              <span className="text-base sm:text-lg font-black text-gray-900 truncate block">
                {financial?.chargeableWeightKg != null
                  ? `${Number(financial.chargeableWeightKg).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`
                  : "—"}
              </span>
            </div>

            <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Total Charge
              </span>
              <span className="text-base sm:text-lg font-black text-gray-900 truncate block text-emerald-600">
                {financial?.totalChargeNGN != null
                  ? `₦${formatCurrencyValue(financial.totalChargeNGN)}`
                  : "—"}
              </span>
            </div>

            <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Attached Docs
              </span>
              <span className="text-base sm:text-lg font-black text-gray-900 truncate block">
                {documents.length}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-gray-100 mt-6 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("shipment")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === "shipment"
                ? "text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            style={{
              backgroundColor: activeTab === "shipment" ? color : "transparent",
            }}
          >
            <Package className="w-4 h-4" />
            <span>Shipment details</span>
          </button>

          <button
            onClick={() => setActiveTab("financials")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === "financials"
                ? "text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            style={{
              backgroundColor: activeTab === "financials" ? color : "transparent",
            }}
          >
            <CircleDollarSign className="w-4 h-4" />
            <span>Financials</span>
            {financial && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === "financials"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                ✓
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === "documents"
                ? "text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            style={{
              backgroundColor: activeTab === "documents" ? color : "transparent",
            }}
          >
            <FileText className="w-4 h-4" />
            <span>Documents</span>
            {documents.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] font-extrabold ${
                  activeTab === "documents"
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {documents.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="w-full">
        {/* ==================================================================== */}
        {/* TAB 1: SHIPMENT DETAILS */}
        {/* ==================================================================== */}
        {activeTab === "shipment" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Core Shipment Information */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      Shipment Overview
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                      Identifiers and lifecycle dates
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Shipment ID
                    </label>
                    <div className="px-3.5 py-2 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 border border-gray-100">
                      {formatShipmentId(resolvedShipmentId)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Airway Bill Number (AWB / MAWB)
                    </label>
                    <div className="px-3.5 py-2 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 border border-gray-100">
                      {mawbNumber}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Status
                    </label>
                    <div className="px-3.5 py-2 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 border border-gray-100 flex items-center justify-between">
                      <span>{shipmentStatus}</span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          shipmentStatus === "Delivered"
                            ? "bg-purple-500"
                            : shipmentStatus === "Flown"
                            ? "bg-blue-500"
                            : shipmentStatus === "Booked"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Shipment Date
                    </label>
                    <div className="px-3.5 py-2 bg-gray-50 rounded-xl text-sm font-medium text-gray-800 border border-gray-100">
                      {formatDate(shipment?.shipmentDate || shipment?.date)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Flight & Routing Information */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <Plane className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      Flight & Routing
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                      Transit route and cargo classification
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Flight Number
                    </label>
                    <div className="px-3.5 py-2 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 border border-gray-100">
                      {financial?.flightNo || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Routing
                    </label>
                    <div className="px-3.5 py-2 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 border border-gray-100">
                      {financial?.routing || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Product / Nature of Goods
                    </label>
                    <div className="px-3.5 py-2 bg-gray-50 rounded-xl text-sm font-medium text-gray-800 border border-gray-100">
                      {financial?.product || shipment?.natureOfGoods || "General Cargo"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Date of Issue
                    </label>
                    <div className="px-3.5 py-2 bg-gray-50 rounded-xl text-sm font-medium text-gray-800 border border-gray-100">
                      {formatDate(financial?.dateOfIssue)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Cargo Particulars & Stakeholders */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      Cargo & Stakeholders
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                      Weights, packages, and agents
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Number of Pieces
                    </label>
                    <div className="px-3.5 py-2 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 border border-gray-100">
                      {financial?.pieces != null ? financial.pieces.toLocaleString() : "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Gross Weight (kg)
                    </label>
                    <div className="px-3.5 py-2 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 border border-gray-100">
                      {financial?.grossWeightKg != null
                        ? `${Number(financial.grossWeightKg).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`
                        : "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Chargeable Weight (kg)
                    </label>
                    <div className="px-3.5 py-2 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 border border-gray-100">
                      {financial?.chargeableWeightKg != null
                        ? `${Number(financial.chargeableWeightKg).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`
                        : "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Agents / Clients
                    </label>
                    <div className="px-3.5 py-2 bg-gray-50 rounded-xl text-sm font-semibold text-gray-800 border border-gray-100 truncate">
                      {financial?.agentsOrClients || shipment?.consignee || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes History Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      Shipment Notes & Activity Log
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                      Operational audit log and comments
                    </p>
                  </div>
                </div>
              </div>

              {shipment?.notes && shipment.notes.length > 0 ? (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                  {shipment.notes.map((note, idx) => (
                    <div
                      key={note.id || idx}
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col gap-1.5"
                    >
                      <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                        {note.content || note.text}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span>
                          {note.createdDate ? formatDateTime(note.createdDate) : "Recorded"}
                        </span>
                        {note.createdByUser && (
                          <span>• by {note.createdByUser}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50/60 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                  No notes recorded for this shipment yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: FINANCIALS */}
        {/* ==================================================================== */}
        {activeTab === "financials" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {financial ? (
              <div className="space-y-6">
                {/* Shipment ID & Actions Banner in Tab Financial */}
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
                          {resolvedShipmentId || financial?.shipmentId || "—"}
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
                    <div className="flex items-center gap-2">
                      {isAccepted && (
                        <>
                          <button
                            onClick={() => setIsEditModalOpen(true)}
                            style={{ borderColor: color, color }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border rounded-lg hover:bg-gray-50 transition-all shadow-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Financial</span>
                          </button>
                          <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Financial</span>
                          </button>
                        </>
                      )}
                      <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">
                        MAWB: {financial?.mawb || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Shipment ID
                      </span>
                      <span className="text-sm font-bold text-gray-900 font-mono select-all">
                        {formatShipmentId(resolvedShipmentId)}
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
                        Agents / Clients
                      </span>
                      <span className="text-sm font-bold text-gray-900 truncate">
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
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3 text-amber-600">
                  <CircleDollarSign className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  No Financial Records Yet
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
                  No financial tariff or billing calculations have been registered for this
                  shipment. You can create one now.
                </p>
                <button
                  onClick={() => setIsCreateFinancialModalOpen(true)}
                  style={{ backgroundColor: color }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Financials</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: DOCUMENTS */}
        {/* ==================================================================== */}
        {activeTab === "documents" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Shipment Documents ({documents.length})
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    All airway bills, customs declarations, and commercial files
                  </p>
                </div>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  style={{ backgroundColor: color }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition shadow-sm w-fit"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              </div>

              {isLoadingDocs ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Loading documents...
                  </p>
                </div>
              ) : documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-gray-50/70 border border-gray-200/80 hover:border-gray-300 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between gap-3 group hover:shadow-md"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm flex-shrink-0">
                          <FileTypeIcon contentType={doc.contentType} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-sm font-bold text-gray-800 truncate"
                            title={doc.fileName || "Document"}
                          >
                            {doc.fileName || "Unnamed Document"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span>{formatBytes(doc.fileSize)}</span>
                            <span>•</span>
                            <span>{formatDate(doc.createdDate)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200/60">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => handleDownloadDoc(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-gray-50/40 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <FolderOpen className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-gray-800 mb-1">
                    No documents uploaded
                  </h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
                    There are no documents attached to this shipment yet. Upload
                    manifests, airway bills, or invoices.
                  </p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    style={{ backgroundColor: color }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition shadow-md"
                  >
                    <FileUp className="w-4 h-4" />
                    <span>Upload First Document</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* Edit Financials Modal */}
      {isEditModalOpen && financial && (
        <EditFinancialsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          financialData={{
            ...financial,
            shipmentStatus,
            isLocked,
          }}
          airlineId={airlineId}
          color={color}
          isViewOnly={false}
          isLocked={isLocked}
        />
      )}

      {/* Create Financials Modal */}
      {isCreateFinancialModalOpen && (
        <CreateFinancialsModal
          isOpen={isCreateFinancialModalOpen}
          onClose={() => setIsCreateFinancialModalOpen(false)}
          airlineId={airlineId}
          shipmentId={resolvedShipmentId}
          airwayBillNumber={mawbNumber}
          color={color}
        />
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          document={previewDoc}
          onDownload={handleDownloadDoc}
        />
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          airlineId={airlineId}
          shipmentId={resolvedShipmentId}
          airwayBillNumber={mawbNumber}
          color={color}
        />
      )}

      {/* Delete Financial Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteFinancial}
        title="Delete Financial Record"
        message="Are you sure you want to delete the financial record for MAWB"
        identifier={mawbNumber}
        isDeleting={isDeleting}
        color={color}
      />

      {/* Delete Shipment Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteShipmentModalOpen}
        onClose={() => setIsDeleteShipmentModalOpen(false)}
        onConfirm={handleConfirmDeleteShipment}
        title="Delete Shipment"
        message="Are you sure you want to delete shipment"
        identifier={mawbNumber}
        isDeleting={isDeletingShipment}
        color={color}
      />
    </div>
  );
};

export default ShipmentDetailsPage;
