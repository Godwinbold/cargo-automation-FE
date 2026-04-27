import { useMutation, useQuery } from "@tanstack/react-query";
import shipmentApi from "../api/shipment";

// Hook to get shipments
export const useGetShipments = (airlineId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ["shipments", airlineId, params],
    queryFn: () => shipmentApi.getShipments(airlineId, params),
    enabled: !!airlineId,
    ...options,
  });
};

// Hook to create a shipment
export const useCreateShipment = () => {
  return useMutation({
    mutationFn: ({ airlineId, data }) =>
      shipmentApi.createShipment(airlineId, data),
  });
};

// Hook to search shipments by AWB
export const useSearchShipments = (airlineId, awbNumber, options = {}) => {
  return useQuery({
    queryKey: ["shipments", "search", airlineId, awbNumber],
    queryFn: () => shipmentApi.searchShipments(airlineId, awbNumber),
    enabled: !!airlineId && !!awbNumber,
    ...options,
  });
};

// Hook to filter shipments
export const useFilterShipments = (airlineId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ["shipments", "filter", airlineId, params],
    queryFn: () => shipmentApi.filterShipments(airlineId, params),
    enabled: !!airlineId,
    ...options,
  });
};

// Hook to get shipments by status
export const useGetShipmentsByStatus = (airlineId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ["shipments", "status", airlineId, params],
    queryFn: () => shipmentApi.getShipmentsByStatus(airlineId, params),
    enabled: !!airlineId,
    ...options,
  });
};

// Hook to get shipment by ID
export const useGetShipmentById = (airlineId, id, options = {}) => {
  return useQuery({
    queryKey: ["shipment", airlineId, id],
    queryFn: () => shipmentApi.getShipmentById(airlineId, id),
    enabled: !!airlineId && !!id,
    ...options,
  });
};

// Hook to add shipment note
export const useAddShipmentNote = () => {
  return useMutation({
    mutationFn: ({ airlineId, id, data }) =>
      shipmentApi.addShipmentNote(airlineId, id, data),
  });
};

// Hook to change shipment status
export const useChangeShipmentStatus = () => {
  return useMutation({
    mutationFn: ({ airlineId, id, data }) =>
      shipmentApi.changeShipmentStatus(airlineId, id, data),
  });
};

// Hook to delete shipment
export const useDeleteShipment = () => {
  return useMutation({
    mutationFn: ({ airlineId, id }) =>
      shipmentApi.deleteShipment(airlineId, id),
  });
};

// --- Document Hooks ---

// Hook to get document by ID
export const useGetDocumentById = (airlineId, shipmentId, id, options = {}) => {
  return useQuery({
    queryKey: ["document", airlineId, shipmentId, id],
    queryFn: () => shipmentApi.getDocumentById(airlineId, shipmentId, id),
    enabled: !!airlineId && !!shipmentId && !!id,
    ...options,
  });
};

// Hook to get all documents for a shipment
export const useGetDocuments = (
  airlineId,
  shipmentId,
  params = {},
  options = {},
) => {
  return useQuery({
    queryKey: ["documents", airlineId, shipmentId, params],
    queryFn: () => shipmentApi.getDocuments(airlineId, shipmentId, params),
    enabled: !!airlineId && !!shipmentId,
    ...options,
  });
};

// Hook to upload a document
export const useUploadDocument = () => {
  return useMutation({
    mutationFn: ({ airlineId, shipmentId, data }) =>
      shipmentApi.uploadDocument(airlineId, shipmentId, data),
  });
};

// Hook to update a document
export const useUpdateDocument = () => {
  return useMutation({
    mutationFn: ({ airlineId, shipmentId, id, data }) =>
      shipmentApi.updateDocument(airlineId, shipmentId, id, data),
  });
};

// Hook to delete a document
export const useDeleteDocument = () => {
  return useMutation({
    mutationFn: ({ airlineId, shipmentId, id }) =>
      shipmentApi.deleteDocument(airlineId, shipmentId, id),
  });
};

// Hook to get all documents for an airline
export const useGetDocumentsForAirline = (airlineId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ["documents", "airline", airlineId, params],
    queryFn: () => shipmentApi.getDocumentsForAirline(airlineId, params),
    enabled: !!airlineId,
    ...options,
  });
};

// --- Financial Hooks ---

// Hook to get financials for a shipment
export const useGetFinancial = (airlineId, shipmentId, options = {}) => {
  return useQuery({
    queryKey: ["financial", airlineId, shipmentId],
    queryFn: () => shipmentApi.getFinancial(airlineId, shipmentId),
    enabled: !!airlineId && !!shipmentId,
    ...options,
  });
};

// Hook to create financials
export const useCreateFinancial = () => {
  return useMutation({
    mutationFn: ({ airlineId, shipmentId, data }) =>
      shipmentApi.createFinancial(airlineId, shipmentId, data),
  });
};

// Hook to update financials
export const useUpdateFinancial = () => {
  return useMutation({
    mutationFn: ({ airlineId, shipmentId, financialId, data }) =>
      shipmentApi.updateFinancial(airlineId, shipmentId, financialId, data),
  });
};

// Hook to delete financials
export const useDeleteFinancial = () => {
  return useMutation({
    mutationFn: ({ airlineId, shipmentId, financialId }) =>
      shipmentApi.deleteFinancial(airlineId, shipmentId, financialId),
  });
};

// Hook to get all financials for an airline
export const useGetAirlinesFinancials = (airlineId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ["financials", "airline", airlineId, params],
    queryFn: () => shipmentApi.getAirlinesFinancials(airlineId, params),
    enabled: !!airlineId,
    ...options,
  });
};

// Group hook
export const useShipment = () => {
  return {
    useGetShipments,
    useCreateShipment,
    useSearchShipments,
    useGetShipmentById,
    useAddShipmentNote,
    useChangeShipmentStatus,
    useDeleteShipment,
    useGetDocumentById,
    useGetDocuments,
    useUploadDocument,
    useUpdateDocument,
    useDeleteDocument,
    useGetFinancial,
    useCreateFinancial,
    useUpdateFinancial,
    useDeleteFinancial,
    useFilterShipments,
    useGetShipmentsByStatus,
    useGetDocumentsForAirline,
    useGetAirlinesFinancials,
  };
};

export default useShipment;
