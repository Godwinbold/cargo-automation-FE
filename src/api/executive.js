import axiosInstance from "../utils/axios";

export const executiveApi = {
  getDashboard: async (params) => {
    const response = await axiosInstance.get("/executive/dashboard", {
      params,
    });
    return response.data;
  },
};

export default executiveApi;
