import axiosClient from "../axiosClient";
import { ApiResponse, PageResponse } from "../types/api.response";
import { InventoryCriteria, InventoryResponse } from "../types/inventory.types";

const BASE_URL = "/inventories";

export const inventoryService = {
  // GET /inventories
  getAll: async (page: number, size: number, sortBy: string = "id") => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<InventoryResponse>>>(
      BASE_URL,
      { params: { page, size, sortBy } }
    );
    return response.result!;
  },

  // GET /inventories/{id}
  getById: async (id: number) => {
    const response = await axiosClient.get<any, ApiResponse<InventoryResponse>>(
      `${BASE_URL}/${id}`
    );
    return response.result!;
  },

  // GET /inventories/search
  search: async (criteria: InventoryCriteria) => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<InventoryResponse>>>(
      `${BASE_URL}/search`,
      { params: criteria }
    );
    return response.result!;
  },
};