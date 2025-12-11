import axiosClient from "../axiosClient";
import { ApiResponse } from "../types/api.response";
import { AddressRequest, AddressResponse } from "../types/customer.types";

const BASE_URL = "/addresses";

export const addressService = {
  // GET /addresses/{customerId} (Lấy danh sách địa chỉ theo ID khách hàng)
  getByCustomerId: async (customerId: number) => {
    const response = await axiosClient.get<any, ApiResponse<AddressResponse[]>>(
      `${BASE_URL}/${customerId}`
    );
    return response.result!;
  },

  // POST /addresses (Tạo mới địa chỉ)
  create: async (data: AddressRequest & { customerId: number }) => {
    const response = await axiosClient.post<any, ApiResponse<AddressResponse>>(
      BASE_URL,
      data
    );
    return response.result!;
  },

  // DELETE /addresses/{addressId} (Xóa địa chỉ)
  delete: async (addressId: number) => {
    const response = await axiosClient.delete<any, ApiResponse<string>>(
      `${BASE_URL}/${addressId}`
    );
    return response.result;
  },
};