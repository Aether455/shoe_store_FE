import axiosClient from "../axiosClient";
import { ApiResponse } from "../types/api.response"; // Hoặc tạo type chung
import { CategoryRequest, CategoryResponse } from "../types/category.types";

export const categoryService = {
  // GET /categories
  getAll: async (): Promise<CategoryResponse[]> => {
    const response = await axiosClient.get<any, ApiResponse<CategoryResponse[]>>("/categories");
    console.log(response.result)
    return response.result || [];
  },

  // POST /categories
  create: async (data: CategoryRequest): Promise<CategoryResponse> => {
    const response = await axiosClient.post<any, ApiResponse<CategoryResponse>>("/categories", data);
    return response.result!;
  },

  // PUT /categories/{id}
  update: async (id: number, data: CategoryRequest): Promise<CategoryResponse> => {
    const response = await axiosClient.put<any, ApiResponse<CategoryResponse>>(`/categories/${id}`, data);
    return response.result!;
  },

  // DELETE /categories/{id}
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/categories/${id}`);
  }
};