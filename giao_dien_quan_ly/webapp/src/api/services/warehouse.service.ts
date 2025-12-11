import axiosClient from "../axiosClient";
import {PageResponse, ApiResponse } from "../types/api.response";
import {  WarehouseRequest, WarehouseResponse } from "../types/warehouse.types";

export const warehouseService = {
  // GET /warehouses (Get All with Pagination)
  getAll: async (page: number, size: number, sortBy: string = "id"): Promise<PageResponse<WarehouseResponse>> => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<WarehouseResponse>>>(
      `/warehouses`, 
      { params: { page, size, sortBy } }
    );
    return response.result!;
  },

  // GET /warehouses/search (Search)
  search: async (keyword: string, page: number, size: number,): Promise<PageResponse<WarehouseResponse>> => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<WarehouseResponse>>>(
      `/warehouses/search`,
      { params: { keyword, page, size } }
    );
    return response.result!;
  },

  // POST /warehouses (Create)
  create: async (data: WarehouseRequest): Promise<WarehouseResponse> => {
    const response = await axiosClient.post<any, ApiResponse<WarehouseResponse>>("/warehouses", data);
    return response.result!;
  },

  // PUT /warehouses/{id} (Update)
  update: async (id: number, data: WarehouseRequest): Promise<WarehouseResponse> => {
    const response = await axiosClient.put<any, ApiResponse<WarehouseResponse>>(`/warehouses/${id}`, data);
    return response.result!;
  },

  // DELETE /warehouses/{id} (Delete)
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/warehouses/${id}`);
  },

  // GET /warehouses/{id} (Detail)
  getById: async (id: number): Promise<WarehouseResponse> => {
    const response = await axiosClient.get<any, ApiResponse<WarehouseResponse>>(`/warehouses/${id}`);
    return response.result!;
  }

};