import axiosInstance from "../utils/axios";

export const generalApi = {
  getAllAirlines: async () => {
    const response = await axiosInstance.get("/airlines/get-all-airlines");
    return response.data;
  },

  getAirlineById: async (id) => {
    const response = await axiosInstance.get(
      `/airlines/${id}/get-airline-by-id`,
    );
    return response.data;
  },

  createAirline: async (data) => {
    const response = await axiosInstance.post("/airlines/create-airline", data);
    return response.data;
  },

  updateAirline: async (id, data) => {
    const response = await axiosInstance.put(
      `/airlines/${id}/update-airline`,
      data
    );
    return response.data;
  },

  deleteAirline: async (id) => {
    const response = await axiosInstance.delete(
      `/airlines/${id}/delete-airline`
    );
    return response.data;
  },
};

export default generalApi;
