import axiosClient from "../axiosClient";
import { ApiResponse, PageResponse } from "../types/api.response";
import { StaffResponse, StaffUpdateRequest } from "../types/staff.types";

const BASE_URL = "/staffs";

export const staffService = {
  // GET /staffs (Get all with pagination)
  getAll: async (page: number, size: number, sortBy: string = "id") => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<StaffResponse>>>(
      BASE_URL,
      { params: { page, size, sortBy } }
    );
    return response.result!;
  },

  // GET /staffs/{id} (Detail)
  getById: async (id: number) => {
    const response = await axiosClient.get<any, ApiResponse<StaffResponse>>(
      `${BASE_URL}/${id}`
    );
    return response.result!;
  },

  // PUT /staffs/{id} (Update)
  update: async (id: number, data: StaffUpdateRequest) => {
    const response = await axiosClient.put<any, ApiResponse<StaffResponse>>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.result!;
  },

  // DELETE /staffs/{id}
  delete: async (id: number) => {
    const response = await axiosClient.delete<any, ApiResponse<string>>(
      `${BASE_URL}/${id}`
    );
    return response.result;
  },

  // GET /staffs/search
  search: async (keyword: string, page: number, size: number) => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<StaffResponse>>>(
      `${BASE_URL}/search`,
      { params: { keyword, page, size } }
    );
    return response.result!;
  },
};