import axiosClient from "../axiosClient";
import { ApiResponse, PageResponse } from "../types/api.response";
import { 
  OrderCreationRequest, 
  OrderResponse, 
  SimpleOrderResponse, 
  OrderUpdateRequest,
  OrderUpdateStatusRequest 
} from "../types/order.types";

const BASE_URL = "/orders";

export const orderService = {
  // POST /orders (Create for Admin)
  create: async (data: OrderCreationRequest) => {
    const response = await axiosClient.post<any, ApiResponse<OrderResponse>>(BASE_URL, data);
    return response.result!;
  },

  // GET /orders (Get All)
  getAll: async (page: number, size: number, sortBy: string) => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<SimpleOrderResponse>>>(
      BASE_URL,
      { params: { page, size, sortBy } }
    );
    return response.result!;
  },

  // GET /orders/{id} (Get Detail)
  getById: async (id: number) => {
    const response = await axiosClient.get<any, ApiResponse<OrderResponse>>(
      `${BASE_URL}/${id}`
    );
    return response.result!;
  },

  // PUT /orders/{id} (Update Info)
  updateInfo: async (id: number, data: OrderUpdateRequest) => {
    const response = await axiosClient.put<any, ApiResponse<OrderResponse>>(
      `${BASE_URL}/${id}`, 
      data
    );
    return response.result!;
  },

  // PUT /orders/{id}/status (Update Status)
  updateStatus: async (id: number, data: OrderUpdateStatusRequest) => {
    const response = await axiosClient.put<any, ApiResponse<OrderResponse>>(
      `${BASE_URL}/${id}/status`, 
      data
    );
    return response.result!;
  },

  // GET /orders/search (Search)
  search: async (keyword: string, page: number, size: number) => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<SimpleOrderResponse>>>(
      `${BASE_URL}/search`,
      { params: { keyword, page, size } }
    );
    return response.result!;
  },
};