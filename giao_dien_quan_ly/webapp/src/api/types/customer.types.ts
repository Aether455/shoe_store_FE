import { SimpleUserResponse } from "./user.types";

export interface AddressResponse {
  id: number;
  address: string; // Số nhà/tên đường
  province: string;
  district: string;
  ward: string;
  createAt?: string;
}

export interface CustomerResponse {
  id: number;
  fullName: string;
  phoneNumber: string;
  addresses: AddressResponse[];
  createBy?: SimpleUserResponse;
  updateBy?: SimpleUserResponse;
  createAt: string;
  updateAt: string;
}
export interface SimpleCustomerResponse {
  id: number;
  fullName: string;
  phoneNumber: string;
}

export interface AddressRequest {
  address: string;
  province: string;
  district: string;
  ward: string;
}

export interface CustomerRequest {
  fullName: string;
  phoneNumber: string;
  addresses: AddressRequest[];
}