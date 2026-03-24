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
};

export default generalApi;
