import axiosClient from "../axiosClient";
import { ApiResponse, PageResponse } from "../types/api.response";
import { CustomerRequest, CustomerResponse } from "../types/customer.types";

const BASE_URL = "/customers";

export const customerService = {
  // GET /customers
  getAll: async (page: number, size: number, sortBy: string = "id") => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<CustomerResponse>>>(
      BASE_URL,
      { params: { page, size, sortBy } }
    );
    return response.result!;
  },

  // GET /customers/search
  search: async (keyword: string, page: number) => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<CustomerResponse>>>(
      `${BASE_URL}/search`,
      { params: { keyword, page } }
    );
    return response.result!;
  },

  // GET /customers/{id}
  getById: async (id: number) => {
    const response = await axiosClient.get<any, ApiResponse<CustomerResponse>>(
      `${BASE_URL}/${id}`
    );
    return response.result!;
  },

  // POST /customers
  create: async (data: CustomerRequest) => {
    const response = await axiosClient.post<any, ApiResponse<CustomerResponse>>(
      BASE_URL,
      data
    );
    return response.result!;
  },

  // PUT /customers/{id}
  update: async (id: number, data: CustomerRequest) => {
    const response = await axiosClient.put<any, ApiResponse<CustomerResponse>>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.result!;
  },

  // DELETE /customers/{id}
  delete: async (id: number) => {
    const response = await axiosClient.delete<any, ApiResponse<string>>(
      `${BASE_URL}/${id}`
    );
    return response.result;
  },
};