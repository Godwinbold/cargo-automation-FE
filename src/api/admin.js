import axiosInstance from "../utils/axios";

export const adminApi = {
  inviteUser: async (data) => {
    const response = await axiosInstance.post("/admin/invite-user", data);
    return response.data;
  },

  getAppUsers: async (params) => {
    const response = await axiosInstance.get("/admin/get-app-users", { params });
    return response.data;
  },
};

export default adminApi;
