import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost/api",
});

// ---------------- REQUEST ----------------
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------- RESPONSE ----------------
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => { 
    const originalRequest = error.config;

    // DO NOT refresh for auth endpoints
    if (
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // Handle expired access token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh_token");

        if (!refresh) throw new Error("No refresh token");

        const res = await axios.post(
          "http://localhost/api/auth/refresh/",
          { refresh }
        );

        localStorage.setItem("access_token", res.data.access);

        originalRequest.headers.Authorization =
          `Bearer ${res.data.access}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/auth/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
