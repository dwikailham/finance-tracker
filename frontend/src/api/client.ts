import axios from "axios";
import { notification } from "antd";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor — tambahkan access token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle token expired & global error messaging
apiClient.interceptors.response.use(
  (response) => {
    // Bisa tambahkan custom handling di sini jika perlu (misal: format data)
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 1. Handle Token Refresh (401 Unauthorized)
    const isAuthRoute = originalRequest.url?.includes('/auth/login') || 
                        originalRequest.url?.includes('/auth/register') ||
                        originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        localStorage.setItem("accessToken", data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // 2. Global UI Error Notification
    // Skip notification for 401 because it's either being refreshed or redirected
    // Skip if it's a silent request (custom flag if needed)
    if (error.response?.status !== 401) {
      let message = "Terjadi kesalahan sistem";
      let description = "Mohon coba kembali dalam beberapa saat.";

      if (!error.response) {
        // Network Error / Timeout
        message = "Koneksi Terputus";
        description = "Periksa koneksi internet Anda atau server sedang maintenance.";
      } else {
        // Server Error (500, 400, 403, 404, 429)
        const errorData = error.response.data;
        description = errorData.message || description;
        
        if (error.response.status === 429) {
          message = "Terlalu Banyak Permintaan";
          description = "Mohon tunggu sejenak sebelum mencoba lagi.";
        } else if (error.response.status >= 500) {
          message = "Kesalahan Server";
        }
      }

      notification.error({
        message,
        description,
        placement: "bottomRight",
        duration: 4,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
