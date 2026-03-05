import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Handle responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Unauthorized → redirect to login
    if (error.response?.status === 401) {
      console.warn("Session expired. Redirecting to login.");

      localStorage.removeItem("token");
      window.location.href = "/";
    }

    // Forbidden
    if (error.response?.status === 403) {
      console.warn("Access denied:", error.response.data);
    }

    // Network error
    if (!error.response) {
      console.error("Network error: Backend may not be running.");
    }

    return Promise.reject(error);
  }
);

export default api;