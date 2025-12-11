import { SimpleUserResponse } from "./user.types";

export interface BrandResponse {
  id: number; 
  name: string;
  description: string;
  createBy: SimpleUserResponse;
  updateBy: SimpleUserResponse;
  createAt: string; // LocalDate "YYYY-MM-DD"
  updateAt: string;
}

export interface BrandRequest {
  name: string;
  description: string;
}

// --- Common ---
export interface SimpleBrandResponse {
  id: number;
  name: string;
  description?: string;
}