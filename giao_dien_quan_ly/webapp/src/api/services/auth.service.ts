import { ApiResponse } from '../types/api.response';
import axiosClient from '../axiosClient';
import { jwtDecode } from "jwt-decode"; 

import { 
  LoginRequest, 
  AuthenticationResponse, 
  LogoutRequest 
} from '../types/auth.types';
import { tokenUtils } from '../../utils/tokenUtils';

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await axiosClient.post<unknown, ApiResponse<AuthenticationResponse>>('/auth/login', data);
    
    if (response.result && response.result.token) {
      const token = response.result.token;
      tokenUtils.setToken(token);

      try {
        const decoded: any = jwtDecode(token);
        
        // 1. Lấy Subject (Username)
        if (decoded.sub) {
          localStorage.setItem('username', decoded.sub);
        }

        // 2. Lấy Scope (Roles)
        if (decoded.scope) {
          localStorage.setItem('roles', decoded.scope);
        }
      } catch (error) {
        console.error("Lỗi decode token:", error);
      }
      // -------------------------------

      localStorage.setItem('isLoggedIn', 'true');
    }
    console.log(response.result)
    return response.result;
    
  },

  logout: async (): Promise<void> => {
    const token = tokenUtils.getToken();
    if (token) {
      try {
        const request: LogoutRequest = { token };
        await axiosClient.post('/auth/logout', request);
      } catch (error) {
        console.error("Logout API error", error);
      }
    }
    
    // Xóa sạch localStorage
    tokenUtils.removeToken();
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    localStorage.removeItem('isLoggedIn');
  },

  isAuthenticated: (): boolean => {
    return !!tokenUtils.getToken();
  }
};