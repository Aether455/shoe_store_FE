import axiosClient from "../axiosClient";
import { ApiResponse, PageResponse } from "../types/api.response";
import { InventoryTransactionResponse } from "../types/inventory-transaction.types";

const BASE_URL = "/inventory-transactions";

export const inventoryTransactionService = {
  // GET /inventory-transactions
  getAll: async (page: number, size: number, sortBy: string = "id") => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<InventoryTransactionResponse>>>(
      BASE_URL,
      { params: { page, size, sortBy } }
    );
    return response.result!;
  },

  // GET /inventory-transactions/{id}
  getById: async (id: number) => {
    const response = await axiosClient.get<any, ApiResponse<InventoryTransactionResponse>>(
      `${BASE_URL}/${id}`
    );

    console.log(response)
    return response.result!;
  },

  // GET /inventory-transactions/search
  search: async (keyword: string, page: number) => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<InventoryTransactionResponse>>>(
      `${BASE_URL}/search`,
      { params: { keyword, page } }
    );
    return response.result!;
  },
};