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
};

export default shipmentApi;
