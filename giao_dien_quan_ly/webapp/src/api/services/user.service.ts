import axiosClient from "../axiosClient";
import { ApiResponse, PageResponse } from "../types/api.response";
import { 
  SimpleUserInfoResponse,
  SimpleUserResponse,
  UserChangePasswordRequest,
  UserCreationRequest, 
  UserCreationRequestForStaff, 
  UserResponse, 
  UserUpdateRequest 
} from "../types/user.types";

const BASE_URL = "/users";

export const userService = {
  // GET /users (Get all with pagination)
  getUsers: async (page: number, size: number, sortBy: string = "id") => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<UserResponse>>>(
      BASE_URL,
      { params: { page, size, sortBy } }
    );
    return response.result!;
  },

  // GET /users/{userId} (Detail)
  getUserById: async (userId: string) => {
    const response = await axiosClient.get<any, ApiResponse<UserResponse>>(
      `${BASE_URL}/${userId}`
    );
    return response.result!;
  },

  // POST /users (Create regular user)
  createUser: async (data: UserCreationRequest) => {
    const response = await axiosClient.post<any, ApiResponse<UserResponse>>(
      BASE_URL,
      data
    );
    return response.result!;
  },

  // POST /users/staffs (Create staff - Service only as requested)
  createUserForStaff: async (data: UserCreationRequestForStaff) => {
    const response = await axiosClient.post<any, ApiResponse<UserResponse>>(
      `${BASE_URL}/staffs`,
      data
    );
    return response.result!;
  },

  // PUT /users/{userId} (Update user)
  updateUser: async (userId: string, data: UserUpdateRequest) => {
    const response = await axiosClient.put<any, ApiResponse<UserResponse>>(
      `${BASE_URL}/${userId}`,
      data
    );
    return response.result!;
  },

  // GET /users/me (Lấy thông tin cá nhân)
  getMyInfo: async () => {
    const response = await axiosClient.get<any, ApiResponse<SimpleUserInfoResponse>>(
      `${BASE_URL}/me`
    );
    return response.result!;
  },

  // PUT /users/change-password (Đổi mật khẩu)
  changePassword: async (data: UserChangePasswordRequest) => {
    const response = await axiosClient.put<any, ApiResponse<SimpleUserResponse>>(
      `${BASE_URL}/change-password`,
      data
    );
    return response.result!;
  },

  // DELETE /users/{userId}
  deleteUser: async (userId: string) => {
    const response = await axiosClient.delete<any, ApiResponse<string>>(
      `${BASE_URL}/${userId}`
    );
    return response.result;
  },

  // GET /users/search
  searchUsers: async (keyword: string, page: number) => {
    const response = await axiosClient.get<any, ApiResponse<PageResponse<UserResponse>>>(
      `${BASE_URL}/search`,
      { params: { keyword, page } }
    );
    return response.result!;
  },
};