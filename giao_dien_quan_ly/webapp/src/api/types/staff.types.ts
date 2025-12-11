import { SimpleUserResponse } from "./user.types"; // Hoặc file chứa SimpleUserResponse

// Khớp với StaffResponse.java
export interface StaffResponse {
  id: number;
  user: SimpleUserResponse;
  fullName: string;
  phoneNumber: string;
  position: string;
  gender: string;
  hireDate: string; // ISO Date
  salary: number;
  createBy: SimpleUserResponse;
  updateBy: SimpleUserResponse;
  createAt: string;
  updateAt: string;
}

// Khớp với StaffUpdateRequest.java
export interface StaffUpdateRequest {
  fullName: string;
  phoneNumber: string;
  gender: string;
  position: string;
  salary: number;
}

