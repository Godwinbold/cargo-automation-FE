import axiosInstance from "../utils/axios";

export const shipmentApi = {
  // Get all shipments for an airline with pagination and search
  getShipments: async (airlineId, params) => {
    const response = await axiosInstance.get(
      `/airlines/${airlineId}/shipments/get-shipments`,
      { params },
    );
    return response.data;
  },

  // Create a new shipment
  createShipment: async (airlineId, data) => {
    const response = await axiosInstance.post(
      `/airlines/${airlineId}/shipments/create-shipment`,
      data,
    );
    return response.data;
  },

  // Search shipments by AWB number
  searchShipments: async (airlineId, awbNumber) => {
    const response = await axiosInstance.get(
      `/airlines/${airlineId}/shipments/search`,
      {
        params: { awbNumber },
      },
    );
    return response.data;
  },

  // Get a single shipment by ID
  getShipmentById: async (airlineId, id) => {
    const response = await axiosInstance.get(
      `/airlines/${airlineId}/shipments/${id}/get-shipment-by-id`,
    );
    return response.data;
  },

  // Add notes to a shipment
  addShipmentNote: async (airlineId, id, data) => {
    const response = await axiosInstance.post(
      `/airlines/${airlineId}/shipments/${id}/add-notes`,
      data,
    );
    return response.data;
  },


  // Delete a shipment
  deleteShipment: async (airlineId, id) => {
    const response = await axiosInstance.delete(
      `/airlines/${airlineId}/shipments/${id}/delete-shipment`,
    );
    return response.data;
  },

  // Get a single document by ID
  getDocumentById: async (airlineId, shipmentId, id) => {
    const response = await axiosInstance.get(
      `/airlines/${airlineId}/shipments/${shipmentId}/documents/${id}/get-document-by-id`,
    );
    return response.data;
  },

  // Get all documents for a shipment with pagination
  getDocuments: async (airlineId, shipmentId, params) => {
    const response = await axiosInstance.get(
      `/airlines/${airlineId}/shipments/${shipmentId}/documents/get-documents`,
      { params },
    );
    return response.data;
  },

  // Upload a document
  uploadDocument: async (airlineId, shipmentId, data) => {
    const formData = new FormData();
    if (data.File) formData.append("File", data.File);
    if (data.UploadedByUserId)
      formData.append("UploadedByUserId", data.UploadedByUserId);

    const response = await axiosInstance.post(
      `/airlines/${airlineId}/shipments/${shipmentId}/documents/upload-document`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // Update a document
  updateDocument: async (airlineId, shipmentId, id, data) => {
    const response = await axiosInstance.put(
      `/airlines/${airlineId}/shipments/${shipmentId}/documents/${id}/update-document`,
      data,
    );
    return response.data;
  },

  // Delete a document
  deleteDocument: async (airlineId, shipmentId, id) => {
    const response = await axiosInstance.delete(
      `/airlines/${airlineId}/shipments/${shipmentId}/documents/${id}/delete-document`,
    );
    return response.data;
  },

  // Get financials for a shipment
  getFinancial: async (airlineId, shipmentId) => {
    const response = await axiosInstance.get(
      `/airlines/${airlineId}/shipments/${shipmentId}/financials/get-financial`,
    );
    return response.data;
  },

  // Create financials for a shipment
  createFinancial: async (airlineId, shipmentId, data) => {
    const response = await axiosInstance.post(
      `/airlines/${airlineId}/shipments/${shipmentId}/financials/create-financial`,
      data,
    );
    return response.data;
  },

  // Update financials for a shipment
  updateFinancial: async (airlineId, shipmentId, financialId, data) => {
    const response = await axiosInstance.put(
      `/airlines/${airlineId}/shipments/${shipmentId}/financials/${financialId}/update-financial`,
      data,
    );
    return response.data;
  },

  // Delete financials for a shipment
  deleteFinancial: async (airlineId, shipmentId, financialId) => {
    const response = await axiosInstance.delete(
      `/airlines/${airlineId}/shipments/${shipmentId}/financials/${financialId}/delete-financial`,
    );
    return response.data;
  },
};

export default shipmentApi;
