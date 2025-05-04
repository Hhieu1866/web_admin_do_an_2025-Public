import axios from 'axios';
import { toast } from 'sonner';

// Tạo một instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 giây
});

// Interceptor xử lý request
axiosInstance.interceptors.request.use(
  (config) => {
    // Log thông tin request để debug
    console.log(`Axios Request: ${config.method.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error("Lỗi trong quá trình tạo request:", error);
    return Promise.reject(error);
  }
);

// Interceptor xử lý response
axiosInstance.interceptors.response.use(
  (response) => {
    // Log thông tin response thành công
    console.log(`Axios Response: ${response.status} từ ${response.config.url}`, {
      data: response.data
    });
    
    // Trả về dữ liệu từ response
    return response.data;
  },
  (error) => {
    // Log chi tiết về lỗi
    console.error("Axios Error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      params: error.config?.params,
      requestData: error.config?.data
    });
    
    // Xử lý lỗi từ API
    const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         'Đã có lỗi xảy ra';
    
    // Hiển thị thông báo lỗi sau khi render hoàn tất để tránh lỗi React
    setTimeout(() => {
      toast.error(errorMessage);
    }, 0);
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 