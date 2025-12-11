import { SimpleUserResponse } from "./user.types";

// Khớp với OptionResponse
export interface OptionResponse {
  id: number;
  name: string;
  optionValues: OptionValueResponse[]; 
  createBy: SimpleUserResponse;
  updateBy: SimpleUserResponse;
  createAt: string;
  updateAt: string;
}

// Khớp với OptionValueResponse
export interface OptionValueResponse {
  id: number;
  value: string;
  createBy: SimpleUserResponse;
  updateBy: SimpleUserResponse;
  createAt: string;
  updateAt: string;
}

export interface SimpleOptionValueResponse {
  id: number;
  value: string;
  optionName?: string; 
}

// Khớp với OptionRequest
export interface OptionRequest {
  name: string;
}

// Khớp với OptionValueRequest
// Dựa vào service: request.getOptionId() và request.getValue()
export interface OptionValueRequest {
  optionId: number;
  value: string;
}