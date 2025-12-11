import { SimpleUserResponse } from "./user.types";

// Dữ liệu gửi lên (Request)
export interface SupplierRequest {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
}

// Dữ liệu nhận về (Response)
export interface SupplierResponse {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  createBy: SimpleUserResponse;
  updateBy: SimpleUserResponse;
  createAt: string;
  updateAt: string;
}

export interface SimpleSupplierResponse {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;

}
