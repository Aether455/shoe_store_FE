import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = 'access_token';

interface DecodedToken {
  sub: string;
  scope: string; // Spring Boot thường lưu roles trong 'scope' cách nhau bởi khoảng trắng
  exp: number;
}

export const tokenUtils = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
  },

  // --- HÀM MỚI: Kiểm tra quyền Admin ---
  isAdmin: (): boolean => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      // Kiểm tra chuỗi scope có chứa ROLE_ADMIN không
      return decoded.scope ? decoded.scope.includes('ROLE_ADMIN') : false;
    } catch (error) {
      return false;
    }
  }
};