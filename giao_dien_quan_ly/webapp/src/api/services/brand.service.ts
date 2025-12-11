import axiosClient from "../axiosClient";
import { ApiResponse } from "../types/api.response";
import { BrandRequest, BrandResponse } from "../types/brand.type";

export const brandService = {
  // GET /brands
  getAll: async (): Promise<BrandResponse[]> => {
    const response = await axiosClient.get<any, ApiResponse<BrandResponse[]>>("/brands");
    return response.result || [];
  },

  // POST /brands
  create: async (data: BrandRequest): Promise<BrandResponse> => {
    const response = await axiosClient.post<any, ApiResponse<BrandResponse>>("/brands", data);
    return response.result!;
  },

  // PUT /brands/{id}
  update: async (id: number, data: BrandRequest): Promise<BrandResponse> => {
    const response = await axiosClient.put<any, ApiResponse<BrandResponse>>(`/brands/${id}`, data);
    return response.result!;
  },

  // DELETE /brands/{id}
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/brands/${id}`);
  }
};