import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenUtils } from '../utils/tokenUtils';

// Cấu hình base URL
const axiosClient = axios.create({
  baseURL: 'https://api.aether.id.vn/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- 1. Request Interceptor ---
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenUtils.getToken();
    // Không gắn token cho các request auth để tránh header quá lớn không cần thiết
    // (Tuỳ chọn, nhưng tốt cho performance)
    if (token && config.headers && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/refresh')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 2. Response Interceptor ---
interface RetryQueueItem {
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}

let isRefreshing = false;
let refreshQueue: RetryQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // ✅ QUAN TRỌNG: Nếu URL là /auth/login hoặc /auth/refresh mà bị lỗi, 
    // thì trả về lỗi ngay lập tức, không chạy logic refresh token.
    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
    }

    // Nếu lỗi không phải 401 hoặc đã retry rồi thì reject luôn
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // ✅ Bổ sung: Nếu không có token trong storage thì cũng không cần refresh làm gì
    if (!tokenUtils.getToken()) {
        return Promise.reject(error);
    }

    // --- Logic Refresh Token (Giữ nguyên) ---
    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        refreshQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const currentToken = tokenUtils.getToken();
      
      const response = await axios.post('http://localhost:8080/api/auth/refresh', {
        token: currentToken,
      });

      const newToken = response.data.result.token;
      
      tokenUtils.setToken(newToken);

      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      processQueue(null, newToken);
      return axiosClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenUtils.removeToken();
      
      // Chỉ redirect nếu đang không ở trang login
      if (window.location.pathname !== '/login') {
          window.location.href = '/login'; 
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;