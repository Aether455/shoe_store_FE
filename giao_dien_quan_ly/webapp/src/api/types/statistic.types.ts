// Khớp với DailyReportResponse.java
export interface DailyReportResponse {
  id: number;
  reportDate: string; // yyyy-MM-dd
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalItemsSold: number;
  newCustomersCount: number;
  totalDiscountAmount: number;
}

// Khớp với DailyReportCriteria.java
export interface DailyReportCriteria {
  totalRevenueStart?: number;
  totalRevenueEnd?: number;
  avgOrderValueStart?: number;
  avgOrderValueEnd?: number;
  reportDateStart?: string;
  reportDateEnd?: string;
}

// Khớp với RevenueReportResponse.java
export interface RevenueReportResponse {
  month: string; // String month
  totalRevenue: number; // Double
}

// Khớp với SellingProductResponse.java
export interface SellingProductResponse {
  productId: number;
  mainImageUrl: string;
  productName: string;
  totalQuantity: number;
}

// Khớp với CategoryRevenueResponse.java
export interface CategoryRevenueResponse {
  categoryId: number;
  categoryName: string;
  totalRevenue: number;
}

// Khớp với BrandRevenueResponse.java
export interface BrandRevenueResponse {
  brandId: number;
  brandName: string;
  totalRevenue: number;
}

// Khớp với ProductRevenueResponse.java
export interface ProductRevenueResponse {
  productId: number;
  mainImageUrl: string;
  productName: string;
  totalRevenue: number;
}