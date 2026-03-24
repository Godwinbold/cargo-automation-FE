import React, { useState, useRef } from "react";
import { X, Upload, File as FileIcon, Loader2 } from "lucide-react";
import { useUploadDocument } from "../../hooks/useShipment";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { GetFromLocalStorage } from "../../utils/getFromLocals";

const UploadDocumentModal = ({
  isOpen,
  onClose,
  airlineId,
  shipmentId,
  airwayBillNumber,
  color,
}) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedByUserId, setUploadedByUserId] = useState(
    localStorage.getItem("userId") || "",
  );
  const { mutate: uploadDoc, isPending: isUploading } = useUploadDocument();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        toast.error(
          "Invalid file type. Only JPEG, JPG, PNG, and PDF are allowed.",
        );
        e.target.value = ""; // Clear the input
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !uploadedByUserId) {
      if (!selectedFile) toast.error("Please select a file");
      if (!uploadedByUserId) toast.error("Please enter a User ID");
      return;
    }

    uploadDoc(
      {
        airlineId,
        shipmentId,
        data: {
          File: selectedFile,
          UploadedByUserId: uploadedByUserId,
        },
      },
      {
        onSuccess: () => {
          toast.success("Document uploaded successfully");
          queryClient.invalidateQueries(["documents", airlineId, shipmentId]);
          onClose();
          setSelectedFile(null);
        },
        onError: (err) => {
          console.error("Upload error:", err);
          toast.error(
            err.response?.data?.message || "Failed to upload document",
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
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          style={{ animation: "modalEntry 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Upload Document
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Shipment: {airwayBillNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer bg-gray-50/30
                ${selectedFile ? "border-green-400 bg-green-50/10" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/20"}
              `}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 text-green-600">
                    <FileIcon className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="mt-4 text-xs font-bold text-red-500 hover:text-red-600 underline"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-500 ring-4 ring-blue-50/50">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    Click to select a file
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, JPG, PNG, or PDF (Max 10MB)
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex  flex-col items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Uploading As ID
              </span>

              <span className="text-sm font-mono font-medium text-gray-600">
                {uploadedByUserId || "N/A"}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !uploadedByUserId || isUploading}
              style={{
                backgroundColor:
                  !selectedFile || !uploadedByUserId || isUploading
                    ? "#f3f4f6"
                    : color,
              }}
              className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2
                ${!selectedFile || !uploadedByUserId || isUploading ? "text-gray-400 cursor-not-allowed border border-gray-200" : "text-white shadow-lg shadow-blue-200"}
              `}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Start Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modalEntry {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default UploadDocumentModal;
