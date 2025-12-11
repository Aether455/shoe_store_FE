import axiosClient from "../axiosClient";
import { ApiResponse, PageResponse } from "../types/api.response";

import { SupplierRequest, SupplierResponse } from "../types/supplier.types";

export const supplierService = {
  // GET /suppliers
  getAll: async (page: number, size: number, sortBy: string = "id") => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<SupplierResponse>>>(
      `/suppliers`,
      { params: { page, size, sortBy } }
    );
    return response.result;
  },

  // GET /suppliers/search
  search: async (keyword: string, page: number) => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<SupplierResponse>>>(
      `/suppliers/search`,
      { params: { keyword, page } }
    );
    return response.result;
  },

  // POST /suppliers
  create: async (data: SupplierRequest) => {
    const response = await axiosClient.post<any, ApiResponse<SupplierResponse>>(
      "/suppliers", 
      data
    );
    return response.result;
  },

  // PUT /suppliers/{id}
  update: async (id: number, data: SupplierRequest) => {
    const response = await axiosClient.put<any, ApiResponse<SupplierResponse>>(
      `/suppliers/${id}`, 
      data
    );
    return response.result;
  },

  // DELETE /suppliers/{id}
  delete: async (id: number) => {
    await axiosClient.delete<any, ApiResponse<string>>(`/suppliers/${id}`);
  },

  // GET /suppliers/{id}
  getById: async (id: number) => {
    const response = await axiosClient.get<any, ApiResponse<SupplierResponse>>(
      `/suppliers/${id}`
    );
    return response.result;
  }
};