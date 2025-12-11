// Enum Role khớp với Backend
export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  CUSTOMER = "CUSTOMER"
}

// Khớp với RoleResponse.java
export interface RoleResponse {
  name: string;
  description: string;
  createAt: string;
}

// Khớp với UserResponse.java
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  createAt: string;
  updateAt: string;
  roles: RoleResponse[];
}

// Khớp với UserCreationRequest.java
export interface UserCreationRequest {
  username: string;
  password: string;
  email: string;
}

// Khớp với UserUpdateRequest.java
export interface UserUpdateRequest {
  email: string;
  roles: string[]; // List<String>
}

// Khớp với UserCreationRequestForStaff.java (Chỉ dùng trong Service theo yêu cầu)
export interface UserCreationRequestForStaff {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  position: string;
  hireDate: string; // ISO Date
  salary: number;
  gender?: string;
}
export interface SimpleUserResponse {
  id: string;
  username: string;
  email: string;
}

export interface SimpleUserInfoResponse {
  id: string;
  username: string;
  email: string;
  roles: RoleResponse[]; // Hoặc string[] tùy backend
}

// Khớp với UserChangePasswordRequest
export interface UserChangePasswordRequest {
  password: string; // Mật khẩu hiện tại (để verify - nếu backend yêu cầu)
  newPassword: string; // Mật khẩu mới
  confirmationPassword: string; // Xác nhận mật khẩu mới (nếu backend yêu cầu check khớp)
  
}

// Khớp với SimpleUserResponse (Response của change password)
export interface SimpleUserResponse {
    id: string;
    username: string;
    email: string;
}