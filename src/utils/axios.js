import instance from "./axiosInstance";
import {
  GetFromLocalStorage,
  SaveToLocalStorage,
  RemoveFromLocalStorage,
} from "./getFromLocals";
import axios from "axios";

instance.interceptors.request.use(
  (config) => {
    const token = GetFromLocalStorage("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = GetFromLocalStorage("refresh_token");

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
          {
            refresh: refreshToken,
          },
        );

        const newAccessToken = response.data.access;
        // Optionally store the new refresh token if it returns one
        if (response.data.refresh) {
          SaveToLocalStorage("refresh_token", response.data.refresh);
        }

        SaveToLocalStorage("access_token", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return instance(originalRequest);
      } catch (refreshError) {
        // Clear all tokens and redirect to login if refresh fails
        RemoveFromLocalStorage("access_token");
        RemoveFromLocalStorage("refresh_token");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
