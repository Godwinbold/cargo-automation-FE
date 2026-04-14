import axios from "axios";

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "https://sadiqtaiwo-001-site1.ntempurl.com"}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
