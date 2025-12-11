import { SimpleUserResponse } from "./user.types";

export interface CategoryResponse {
  id: number; 
  name: string;
  description: string;
  createAt: string; 
  updateAt: string;
  createBy: SimpleUserResponse; // Object user
  updateBy: SimpleUserResponse;
}

export interface SimpleCategoryResponse {
  id: number; 
  name: string;
  description: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
}