export interface AuthenticationResponse {
  token: string;
  authenticated: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshRequest {
  token: string;
}

export interface LogoutRequest {
  token: string;
}
