import axiosClient from "../axiosClient";
import { ApiResponse } from "../types/api.response";

// Enum PaymentStatus (Khớp với Backend)
export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED"
}

// Request Body
export interface PaymentUpdateRequest {
  status: PaymentStatus;
}

// Response Body (đã có trong order.types.ts hoặc tạo mới nếu cần tách biệt)
// Ở đây mình dùng chung hoặc any vì chỉ cần check status code 200

const BASE_URL = "/payments";

export const paymentService = {
  // PUT /payments/{id}
  updateStatus: async (id: number, status: PaymentStatus) => {
    const response = await axiosClient.put<any, ApiResponse<any>>(
      `${BASE_URL}/${id}`, 
      { status }
    );
    return response.result;
  }
};