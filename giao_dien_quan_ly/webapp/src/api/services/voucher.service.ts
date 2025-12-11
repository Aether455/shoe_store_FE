import axiosClient from "../axiosClient";
import { ApiResponse, PageResponse } from "../types/api.response";

import { VoucherRequest, VoucherResponse } from "../types/voucher.types";

export const voucherService = {
  // GET /vouchers
  getAll: async (page: number, size: number, sortBy: string = "id"): Promise<PageResponse<VoucherResponse>> => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<VoucherResponse>>>(
      "/vouchers", 
      { params: { page, size, sortBy } }
    );
    console.log(response.result)
    return response.result!;
  },

  // GET /vouchers/search
  search: async (keyword: string, page: number): Promise<PageResponse<VoucherResponse>> => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<VoucherResponse>>>(
      `/vouchers/search`,
      { params: { keyword, page } }
    );
    return response.result!;
  },

  // GET /vouchers/{id}
  getById: async (id: number): Promise<VoucherResponse> => {
    const response = await axiosClient.get<any, ApiResponse<VoucherResponse>>(`/vouchers/${id}`);
    return response.result!;
  },

  // POST /vouchers
  create: async (data: VoucherRequest): Promise<VoucherResponse> => {
    const response = await axiosClient.post<any, ApiResponse<VoucherResponse>>("/vouchers", data);
    return response.result!;
  },

  // PUT /vouchers/{id}
  update: async (id: number, data: VoucherRequest): Promise<VoucherResponse> => {
    const response = await axiosClient.put<any, ApiResponse<VoucherResponse>>(`/vouchers/${id}`, data);
    return response.result!;
  },

  // DELETE /vouchers/{id}
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete<any, ApiResponse<string>>(`/vouchers/${id}`);
  }
};