import React, { useState } from "react";
import {
  X,
  Download,
  FileText,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";

const DocumentPreviewModal = ({
  isOpen,
  onClose,
  document: docData,
  color,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // Reset state when docData changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setImgError(false);
      setIsIframeLoading(true);
    }
  }, [isOpen, docData]);

  if (!isOpen || !docData) return null;

  const isImage = docData.contentType?.startsWith("image/");
  const isPdf = docData.contentType === "application/pdf";

  // Resolve the file URL — handle cloudinary:// scheme or use storagePath directly
  const resolveUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    // Strip cloudinary:// prefix — the path after is the public resource path
    if (path.startsWith("cloudinary://")) {
      const stripped = path.replace("cloudinary://", "");
      return `https://res.cloudinary.com/${stripped}`;
    }
    return path;
  };

  const fileUrl = resolveUrl(docData.storagePath);

  const formatBytes = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  const handleDownload = () => {
    if (!fileUrl) return;
    const link = window.document.createElement("a");
    link.href = fileUrl;
    link.download = docData.fileName || "document";
    link.target = "_blank";
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          style={{
            animation: "modalEntry 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}15` }}
              >
                <FileText className="w-5 h-5" style={{ color }} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  {docData.fileName || "Document Preview"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {docData.airwayBillNumber} &bull;{" "}
                  {formatBytes(docData.fileSizeBytes)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Zoom controls — image only */}
              {isImage && !imgError && fileUrl && (
                <>
                  <button
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-500 font-mono w-10 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    title="Rotate"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <div className="w-px h-5 bg-gray-200 mx-1" />
                </>
              )}

              {fileUrl && (
                <button
                  onClick={handleDownload}
                  style={{ backgroundColor: color }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview Body */}
          <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-6 min-h-0">
            {!fileUrl ? (
              <div className="flex flex-col items-center justify-center gap-3 text-gray-400 py-16">
                <AlertCircle className="w-12 h-12" />
                <p className="text-sm font-medium">No file URL available</p>
              </div>
            ) : isImage && !imgError ? (
              <div className="overflow-auto max-w-full max-h-full">
                <img
                  src={fileUrl}
                  alt={docData.fileName}
                  onError={() => setImgError(true)}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: "top center",
                    transition: "transform 0.2s ease",
                  }}
                  className="rounded-lg shadow-md max-w-full block"
                />
              </div>
            ) : isPdf && !imgError ? (
              <div className="w-full relative" style={{ height: "65vh" }}>
                {isIframeLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-lg">
                    <div
                      className="animate-spin rounded-full h-8 w-8 border-b-2"
                      style={{ borderColor: color }}
                    />
                  </div>
                )}
                <iframe
                  src={fileUrl}
                  title={docData.fileName}
                  className="w-full h-full rounded-lg shadow-md bg-white border-0"
                  onLoad={() => setIsIframeLoading(false)}
                  onError={() => {
                    setIsIframeLoading(false);
                    setImgError(true);
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 text-gray-500 py-16">
                <div className="w-24 h-24 bg-white rounded-2xl shadow flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    {imgError
                      ? "Unable to preview this file"
                      : "Preview not available"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {docData.contentType}
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  style={{ backgroundColor: color }}
                  className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition shadow"
                >
                  <Download className="w-4 h-4" />
                  Download to view
                </button>
              </div>
            )}
          </div>

          {/* Footer Meta */}
          <div className="flex-shrink-0 px-6 py-3 border-t border-gray-100 bg-gray-50/60 flex flex-wrap gap-x-6 gap-y-1">
            {[
              { label: "Uploaded", value: formatDate(docData.uploadedAt) },
              {
                label: "Shipment Date",
                value: docData.shipmentDate
                  ? formatDate(docData.shipmentDate)
                  : "-",
              },
              { label: "Type", value: docData.contentType || "-" },
              {
                label: "Size",
                value: formatBytes(docData.fileSizeBytes) || "-",
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {label}:
                </span>
                <span className="text-xs text-gray-600">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalEntry {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
};

export default DocumentPreviewModal;
