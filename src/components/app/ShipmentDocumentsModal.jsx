import React, { useState } from "react";
import {
  X,
  FileText,
  Download,
  Eye,
  AlertCircle,
  Loader2,
  FileImage,
  FileIcon,
  FolderOpen,
} from "lucide-react";
import { useGetDocuments } from "../../hooks/useShipment";
import DocumentPreviewModal from "./DocumentPreviewModal";

const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
  if (contentType?.startsWith("image/"))
    return <FileImage className="w-5 h-5 text-blue-500" />;
  if (contentType === "application/pdf")
    return <FileText className="w-5 h-5 text-red-500" />;
  return <FileIcon className="w-5 h-5 text-gray-400" />;
};

const ShipmentDocumentsModal = ({
  isOpen,
  onClose,
  airlineId,
  shipment,
  color,
}) => {
  const [previewDoc, setPreviewDoc] = useState(null);

  const {
    data: documentsData,
    isLoading,
    error,
  } = useGetDocuments(airlineId, shipment?.id, { pageSize: 50 }, { enabled: isOpen && !!shipment?.id });

  const documents = React.useMemo(() => {
    const raw = documentsData?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  }, [documentsData]);

  const handleDownload = (doc) => {
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

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          style={{ animation: "docModalEntry 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color || "#3DA5E0"}18` }}
              >
                <FolderOpen className="w-5 h-5" style={{ color: color || "#3DA5E0" }} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  Shipment Documents
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  {shipment?.airwayBillNumber}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition ml-2 flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: color || "#3DA5E0" }} />
                <p className="text-sm font-medium">Loading documents…</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-red-400">
                <AlertCircle className="w-10 h-10" />
                <p className="text-sm font-medium">Failed to load documents</p>
                <p className="text-xs text-gray-400">
                  {error?.response?.data?.message || error?.message || "Unknown error"}
                </p>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-gray-400">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
                  <FolderOpen className="w-9 h-9 text-gray-300" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-500">No documents attached</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Use "Upload Document" from the action menu to attach files to this shipment.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">
                  {documents.length} document{documents.length !== 1 ? "s" : ""} attached
                </p>
                {documents.map((doc, idx) => {
                  const fileUrl = resolveUrl(doc.storagePath);
                  const isImage = doc.contentType?.startsWith("image/");
                  const isPdf = doc.contentType === "application/pdf";
                  const canPreview = isImage || isPdf;
                  return (
                    <div
                      key={doc.id || idx}
                      className="flex items-center gap-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-3.5 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <FileTypeIcon contentType={doc.contentType} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {doc.fileName || `Document ${idx + 1}`}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {doc.contentType && (
                            <span className="text-[11px] text-gray-400 font-medium">
                              {doc.contentType}
                            </span>
                          )}
                          {doc.fileSizeBytes && (
                            <span className="text-[11px] text-gray-400">
                              {formatBytes(doc.fileSizeBytes)}
                            </span>
                          )}
                          {(doc.uploadedAt || doc.createdDate) && (
                            <span className="text-[11px] text-gray-400">
                              {formatDate(doc.uploadedAt || doc.createdDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {canPreview && (
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {fileUrl && (
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        color={color}
        zIndex={300}
      />

      <style>{`
        @keyframes docModalEntry {
          from { opacity: 0; transform: scale(0.93) translateY(14px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </>
  );
};

export default ShipmentDocumentsModal;