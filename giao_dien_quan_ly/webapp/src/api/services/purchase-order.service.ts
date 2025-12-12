import axiosClient from "../axiosClient";
import { ApiResponse, PageResponse } from "../types/api.response";
import { 
  PurchaseOrderReportResponse,
  PurchaseOrderRequest, 
  PurchaseOrderResponse, 
  SimplePurchaseOrderResponse 
} from "../types/purchase-order.types";

const BASE_URL = "/purchase-orders";

export const purchaseOrderService = {
  // GET /purchase-orders (Danh sách)
  getAll: async (page: number, size: number, sortBy: string = "id") => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<SimplePurchaseOrderResponse>>>(
      BASE_URL, 
      { params: { page, size, sortBy } }
    );
    return response.result!;
  },

  // GET /purchase-orders/{id} (Chi tiết)
  getById: async (id: number) => {
    const response = await axiosClient.get<any, ApiResponse<PurchaseOrderResponse>>(`${BASE_URL}/${id}`);
    return response.result!;
  },

  // POST /purchase-orders (Tạo mới)
  create: async (data: PurchaseOrderRequest) => {
    const response = await axiosClient.post<any, ApiResponse<SimplePurchaseOrderResponse>>(BASE_URL, data);
    return response.result!;
  },

  // DELETE /purchase-orders/{id} (Xóa - Chỉ DRAFT)
  delete: async (id: number) => {
    const response = await axiosClient.delete<any, ApiResponse<string>>(`${BASE_URL}/${id}`);
    return response.result;
  },

  // PATCH /purchase-orders/{id}/approve (Duyệt - Admin)
  approve: async (id: number) => {
    const response = await axiosClient.patch<any, ApiResponse<PurchaseOrderResponse>>(`${BASE_URL}/${id}/approve`);
    return response.result!;
  },

  // PATCH /purchase-orders/{id}/cancel (Hủy - Admin)
  cancel: async (id: number) => {
    const response = await axiosClient.patch<any, ApiResponse<PurchaseOrderResponse>>(`${BASE_URL}/${id}/cancel`);
    return response.result!;
  },
  
  // Search (Backend có endpoint search)
  search: async (keyword: string, page: number) => {
     const response = await axiosClient.get<any, ApiResponse<PageResponse<SimplePurchaseOrderResponse>>>(
      `${BASE_URL}/search`,
      { params: { keyword, page } }
    );
    return response.result!;
  }
,

  // --- NEW: Complete Order ---
  complete: async (id: number) => {
    const response = await axiosClient.patch<any, ApiResponse<PurchaseOrderResponse>>(`${BASE_URL}/${id}/complete`);
    return response.result!;
  },

  // --- NEW: Get Reports ---
  getReports: async (start: string, end: string, groupBy: 'supplier' | 'month' | 'quarter') => {
    const response = await axiosClient.get<any, ApiResponse<PurchaseOrderReportResponse[]>>(
        `${BASE_URL}/reports`,
        { params: { start, end, groupBy } }
    );
    return response.result!;
  }
  
};