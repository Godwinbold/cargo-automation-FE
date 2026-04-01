import { useState, useEffect } from "react";
import HeaderTitle from "./HeaderTitle";
import DocumentsTable from "./DocumentsTable";
import { useGetDocumentsForAirline, useDeleteDocument } from "../../hooks/useShipment";
import { GetFromLocalStorage } from "../../utils/getFromLocals";
import { useSearchParams } from "react-router-dom";
import ShipmentFilters from "./ShipmentFilters";
import UploadDocumentModal from "./UploadDocumentModal";
import DocumentPreviewModal from "./DocumentPreviewModal";
import EditDocumentModal from "./EditDocumentModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Documents = ({ color, name }) => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const airlineIdFromQuery = searchParams.get("airlineId");
  const airlineId = GetFromLocalStorage("airlineId") || airlineIdFromQuery;

  // Filtering & Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedShipmentForUpload, setSelectedShipmentForUpload] = useState(null);

  // Preview Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDocumentForEdit, setSelectedDocumentForEdit] = useState(null);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, startDate, endDate, pageSize]);

  const {
    data: documents,
    isLoading,
    error,
  } = useGetDocumentsForAirline(airlineId, {
    page: currentPage,
    pageSize,
    search: debouncedSearch,
    startDate,
    endDate,
  });

  // Normalize API shape: { data: items[] } or { data: { items[], totalPages } }
  const documentItems = Array.isArray(documents?.data)
    ? documents.data
    : documents?.data?.items || [];

  const totalPages =
    documents?.data?.totalPages ||
    Math.ceil((documents?.data?.totalCount || documentItems.length || 0) / pageSize);

  // --- Handlers ---

  const handleView = (doc) => {
    setPreviewDocument(doc);
    setIsPreviewModalOpen(true);
  };

  const handleDownload = (doc) => {
    const url = resolveUrl(doc?.storagePath);
    if (!url) {
      toast.info("No file available for download.");
      return;
    }
    const link = window.document.createElement("a");
    link.href = url;
    link.download = doc.fileName || "document";
    link.target = "_blank";
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleUploadClick = (shipmentId = null) => {
    setSelectedShipmentForUpload(shipmentId);
    setIsUploadModalOpen(true);
  };

  const handleEditClick = (doc) => {
    setSelectedDocumentForEdit(doc);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (doc) => {
    if (doc) {
      setDocumentToDelete(doc);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (!documentToDelete) return;
    deleteDocument(
      {
        airlineId,
        shipmentId: documentToDelete.shipmentId,
        id: documentToDelete.id,
      },
      {
        onSuccess: () => {
          toast.success("Document deleted successfully");
          queryClient.invalidateQueries(["documents", "airline", airlineId]);
          setIsDeleteModalOpen(false);
          setDocumentToDelete(null);
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Failed to delete document");
        },
      }
    );
  };

  return (
    <div className="flex flex-col p-4 min-h-screen">
      <div className="flex-none flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <HeaderTitle
          title="Documents"
          description="Access and manage scanned airway bills, cargo forms, and shipment records in one place."
        />
      </div>

      <div className="flex-none px-2 mb-2">
        <ShipmentFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          color={color}
        />
      </div>

      <div className="flex-1 px-2 min-h-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="mt-4 text-gray-500">Loading documents...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100 italic">
            Error loading documents. Please try again.
          </div>
        ) : documentItems.length > 0 ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
              <DocumentsTable
                data={documentItems}
                color={color}
                airlineId={airlineId}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                onView={handleView}
                onDownload={handleDownload}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onUpload={() => handleUploadClick()}
              />
            </div>
          </div>
        ) : (
          <div className="mt-8 p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">No documents found.</p>
            <button
              onClick={() => handleUploadClick()}
              style={{ backgroundColor: color }}
              className="mt-4 px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition shadow-sm font-medium"
            >
              + Upload Document
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => { setIsUploadModalOpen(false); setSelectedShipmentForUpload(null); }}
        airlineId={airlineId}
        shipmentId={selectedShipmentForUpload}
        airwayBillNumber=""
        color={color}
      />

      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => { setIsPreviewModalOpen(false); setPreviewDocument(null); }}
        document={previewDocument}
        color={color}
      />

      {/* Edit Modal */}
      <EditDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedDocumentForEdit(null); }}
        airlineId={airlineId}
        document={selectedDocumentForEdit}
        color={color}
      />

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Document"
        message="Are you sure you want to delete"
        identifier={documentToDelete?.fileName}
        isDeleting={isDeleting}
        color={color}
      />
    </div>
  );
};

// Resolve cloudinary:// or plain URL
function resolveUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("cloudinary://")) {
    return `https://res.cloudinary.com/${path.replace("cloudinary://", "")}`;
  }
  return path;
}

export default Documents;
