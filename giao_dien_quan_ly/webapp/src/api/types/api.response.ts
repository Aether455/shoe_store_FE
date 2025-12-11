export interface ApiResponse<T> {
  code?: number;
  message?: string;
  result?: T;
}

// Cấu trúc Page khớp với JSON: "page": { "size": 10, ... }
export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  content: T[];
  page: PageInfo; 
}