  import { SimpleUserResponse } from "./user.types";



  // Khớp với com.nguyenkhang.mobile_store.dto.response.WarehouseResponse
  export interface WarehouseResponse {
    id: number;
    name: string;
    address: string;
    description: string;
    priority: number;
    province: string;
    district: string;
    ward: string;
    createBy: SimpleUserResponse;
    updateBy: SimpleUserResponse;
    createAt: string;
    updateAt: string;
  }
  export interface SimpleWarehouseResponse {
    id: number;
    name: string;
    address: string;
    description: string;

  }
  // Khớp với com.nguyenkhang.mobile_store.dto.request.WarehouseRequest
  export interface WarehouseRequest {
    name: string;
    address: string;
    priority: number;
    province: string;
    district: string;
    ward: string;
    description: string;
  }